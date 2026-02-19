"""
Gera dois arquivos usando o OpenStreetMap (Overpass API):
  1. ../public/distritos-sp.json  — GeoJSON dos 96 distritos para o front-end
  2. ./distritos_sp_insert.sql    — SQL com INSERTs para o Supabase

Como usar:
  cd supabase
  python gerar_distritos_sp.py

  Depois, no SQL Editor do Supabase, execute:
    1. setup_tendencias.sql
    2. distritos_sp_insert.sql
"""

import json
import math
import os
import sys

try:
    import requests
except ImportError:
    sys.exit("Instale o pacote 'requests':  pip install requests")

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PUBLIC_DIR = os.path.join(SCRIPT_DIR, "..", "public")
GEOJSON_PATH = os.path.join(PUBLIC_DIR, "distritos-sp.json")
SQL_PATH = os.path.join(SCRIPT_DIR, "distritos_sp_insert.sql")

OVERPASS_QUERY = (
    '[out:json][timeout:90];'
    'area["name"="São Paulo"]["admin_level"="8"]["boundary"="administrative"]->.a;'
    '(relation["boundary"="administrative"]["admin_level"="9"](area.a););'
    'out geom;'
)
OVERPASS_URL = "https://overpass.kumi.systems/api/interpreter"


# ---------------------------------------------------------------------------
# Converte as ways OSM de uma relação em anéis de polígono (lon, lat)
# ---------------------------------------------------------------------------

def ways_to_rings(ways: list) -> list:
    """Monta anéis fechados a partir de uma lista de ways OSM."""
    # Cada way é uma lista de pontos (lat, lon)
    # Precisamos encadear os ways para formar anéis fechados
    segments = []
    for way in ways:
        pts = [(p["lon"], p["lat"]) for p in way.get("geometry", [])]
        if len(pts) >= 2:
            segments.append(pts)

    rings = []
    while segments:
        ring = list(segments.pop(0))
        changed = True
        while changed:
            changed = False
            for i, seg in enumerate(segments):
                # verifica se o segmento começa onde o anel termina
                if _pt_eq(ring[-1], seg[0]):
                    ring.extend(seg[1:])
                    segments.pop(i)
                    changed = True
                    break
                elif _pt_eq(ring[-1], seg[-1]):
                    ring.extend(reversed(seg[:-1]))
                    segments.pop(i)
                    changed = True
                    break
                # tenta no início do anel
                elif _pt_eq(ring[0], seg[-1]):
                    ring = seg[:-1] + ring
                    segments.pop(i)
                    changed = True
                    break
                elif _pt_eq(ring[0], seg[0]):
                    ring = list(reversed(seg))[:-1] + ring
                    segments.pop(i)
                    changed = True
                    break
        # fechar o anel se necessário
        if ring and not _pt_eq(ring[0], ring[-1]):
            ring.append(ring[0])
        if len(ring) >= 4:
            rings.append(ring)
    return rings


def _pt_eq(a, b, eps=1e-7):
    return abs(a[0] - b[0]) < eps and abs(a[1] - b[1]) < eps


def _ring_area(ring):
    """Área com sinal do anel (positivo = sentido anti-horário)."""
    n = len(ring)
    area = 0.0
    for i in range(n):
        j = (i + 1) % n
        area += ring[i][0] * ring[j][1]
        area -= ring[j][0] * ring[i][1]
    return area / 2.0


def rings_to_geometry(outer_ways, inner_ways):
    """Constrói um Polygon ou MultiPolygon GeoJSON a partir de ways."""
    outer_rings = ways_to_rings(outer_ways)
    inner_rings = ways_to_rings(inner_ways)

    if not outer_rings:
        return None

    # Garantir sentido correto: outer = anti-horário, inner = horário (GeoJSON RFC 7946)
    def ensure_ccw(ring):
        if _ring_area(ring) < 0:
            return ring[::-1]
        return ring

    def ensure_cw(ring):
        if _ring_area(ring) > 0:
            return ring[::-1]
        return ring

    outer_rings = [ensure_ccw(r) for r in outer_rings]
    inner_rings = [ensure_cw(r) for r in inner_rings]

    if len(outer_rings) == 1:
        coords = [outer_rings[0]] + inner_rings
        return {"type": "Polygon", "coordinates": coords}
    else:
        # MultiPolygon: cada outer ring forma um polygon (com seus holes)
        polys = [[outer_rings[0]] + inner_rings]
        for r in outer_rings[1:]:
            polys.append([r])
        return {"type": "MultiPolygon", "coordinates": polys}


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    print("Baixando 96 distritos de São Paulo via Overpass API...")
    try:
        resp = requests.post(OVERPASS_URL, data={"data": OVERPASS_QUERY}, timeout=120)
        resp.raise_for_status()
    except requests.exceptions.RequestException as e:
        sys.exit(f"Erro na requisição Overpass: {e}")

    data = resp.json()
    elements = data.get("elements", [])
    print(f"  {len(elements)} relações recebidas.")

    if not elements:
        sys.exit("Nenhuma relação encontrada. Verifique a query Overpass.")

    features = []
    skipped = 0
    for elem in elements:
        nome = elem.get("tags", {}).get("name", "").upper()
        if not nome:
            skipped += 1
            continue

        members = elem.get("members", [])
        outer_ways = [m for m in members if m.get("role") == "outer"]
        inner_ways = [m for m in members if m.get("role") == "inner"]

        geometry = rings_to_geometry(outer_ways, inner_ways)
        if geometry is None:
            print(f"  [AVISO] Geometria vazia para {nome}, ignorando.")
            skipped += 1
            continue

        features.append({
            "type": "Feature",
            "properties": {
                "nome": nome,
                "osm_id": elem.get("id"),
            },
            "geometry": geometry,
        })

    print(f"  {len(features)} distritos com geometria ({skipped} ignorados).")

    geojson = {"type": "FeatureCollection", "features": features}

    # --- Salvar GeoJSON para o front-end ---
    os.makedirs(PUBLIC_DIR, exist_ok=True)
    with open(GEOJSON_PATH, "w", encoding="utf-8") as f:
        json.dump(geojson, f, ensure_ascii=False, separators=(",", ":"))
    size_kb = os.path.getsize(GEOJSON_PATH) // 1024
    print(f"\nGeoJSON salvo em: {GEOJSON_PATH}  ({size_kb} KB)")

    # --- Gerar SQL de INSERTs ---
    lines = [
        "-- INSERTs dos distritos de São Paulo (fonte: OpenStreetMap)",
        "-- Gerado automaticamente por gerar_distritos_sp.py",
        "BEGIN;",
        "",
    ]

    for feat in features:
        nome = feat["properties"]["nome"].replace("'", "''")
        osm_id = str(feat["properties"]["osm_id"])
        geom_json = json.dumps(feat["geometry"], ensure_ascii=False).replace("'", "''")
        geom_type = feat["geometry"]["type"]
        # ST_Multi garante que seja sempre MultiPolygon
        cast = "ST_Multi(ST_GeomFromGeoJSON('{}'))".format(geom_json)

        lines.append(
            f"INSERT INTO distritos_sp (nome, codigo_ibge, geom) VALUES (\n"
            f"  '{nome}',\n"
            f"  'osm_{osm_id}',\n"
            f"  {cast}\n"
            f") ON CONFLICT (nome) DO NOTHING;"
        )

    lines += ["", "COMMIT;", ""]

    with open(SQL_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    size_sql = os.path.getsize(SQL_PATH) // 1024
    print(f"SQL gerado em:   {SQL_PATH}  ({size_sql} KB)")
    print(f"\nPróximo passo: no SQL Editor do Supabase, execute:")
    print(f"  1. setup_tendencias.sql")
    print(f"  2. distritos_sp_insert.sql")


if __name__ == "__main__":
    main()
