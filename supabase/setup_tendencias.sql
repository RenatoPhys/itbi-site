-- =============================================================
-- Setup da página Tendências: mapas coropléticos por distrito SP
-- =============================================================
-- Execute no SQL Editor do Supabase (em ordem):
--   1. Este arquivo (setup_tendencias.sql)
--   2. O arquivo gerado pelo script gerar_distritos_sp.py
-- =============================================================

-- Etapa 1: Habilitar PostGIS
-- (se não estiver ativado: Dashboard > Database > Extensions > postgis)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Etapa 2: Tabela de distritos de São Paulo
CREATE TABLE IF NOT EXISTS distritos_sp (
  id serial PRIMARY KEY,
  nome text NOT NULL UNIQUE,
  codigo_ibge text,
  geom geometry(MultiPolygon, 4326)
);

-- Índice espacial obrigatório para performance
CREATE INDEX IF NOT EXISTS distritos_sp_geom_idx
  ON distritos_sp USING GIST(geom);

-- RLS: leitura pública
ALTER TABLE distritos_sp ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'distritos_sp' AND policyname = 'read_public'
  ) THEN
    CREATE POLICY "read_public" ON distritos_sp FOR SELECT USING (true);
  END IF;
END $$;

-- Etapa 3: Função RPC de agregação por distrito
-- Retorna medianas de valor e preço/m² por distrito para um dado ano.
-- Limitado a anos >= 2020 para poupar recursos no free tier.
CREATE OR REPLACE FUNCTION get_medianas_por_distrito(p_year int)
RETURNS TABLE(
  distrito_nome text,
  median_valor  float,
  median_preco_m2 float,
  n bigint
)
LANGUAGE sql STABLE
AS $$
  SELECT
    d.nome                                                                   AS distrito_nome,
    percentile_cont(0.5) WITHIN GROUP (ORDER BY t.valor)::float              AS median_valor,
    percentile_cont(0.5) WITHIN GROUP (ORDER BY t.preco_m2)::float           AS median_preco_m2,
    count(*)::bigint                                                          AS n
  FROM distritos_sp d
  JOIN transacoes_itbi t
    ON ST_Within(
         ST_SetSRID(ST_MakePoint(t.longitude, t.latitude), 4326),
         d.geom
       )
  WHERE t.anomes BETWEEN p_year * 100 + 1 AND p_year * 100 + 12
    AND t.latitude  IS NOT NULL
    AND t.longitude IS NOT NULL
    AND p_year >= 2020   -- restringir para poupar storage/processamento
  GROUP BY d.nome
  ORDER BY d.nome
$$;
