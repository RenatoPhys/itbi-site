"use client";

import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { DistritoMediana } from "@/lib/types";
import type { FeatureCollection } from "geojson";

interface Props {
  geoJson: FeatureCollection | null;
  data: Record<string, DistritoMediana>;
  metric: "valor" | "preco_m2";
  title: string;
  loading: boolean;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

// Calcula os quantis de quebra a partir dos valores presentes (7 níveis)
function calcBreaks(
  data: Record<string, DistritoMediana>,
  metric: "valor" | "preco_m2"
): number[] {
  const values = Object.values(data)
    .map((d) => (metric === "valor" ? d.median_valor : d.median_preco_m2))
    .filter((v): v is number => v !== null && v > 0)
    .sort((a, b) => a - b);

  if (values.length === 0) return [0, 1, 2, 3, 4, 5, 6];

  const q = (p: number) => values[Math.floor(p * (values.length - 1))];
  // 8 pontos de corte → 7 faixas de cor
  return [q(0), q(1/7), q(2/7), q(3/7), q(4/7), q(5/7), q(6/7), q(1)];
}

// Paleta de 7 cores: azul escuro → azul claro → ciano → verde → amarelo → laranja → vermelho
const PALETTE = ["#2166ac", "#74b9e0", "#a8ddb5", "#41b563", "#f6d860", "#f4a334", "#e83030"];

function getColor(value: number | null, breaks: number[]): string {
  if (value === null || value === 0) return "#e8e8e8";
  if (value <= breaks[1]) return PALETTE[0];
  if (value <= breaks[2]) return PALETTE[1];
  if (value <= breaks[3]) return PALETTE[2];
  if (value <= breaks[4]) return PALETTE[3];
  if (value <= breaks[5]) return PALETTE[4];
  if (value <= breaks[6]) return PALETTE[5];
  return PALETTE[6];
}

function ColorLegend({
  breaks,
  metric,
}: {
  breaks: number[];
  metric: "valor" | "preco_m2";
}) {
  const fmt = (v: number) =>
    metric === "valor"
      ? formatCurrency(v)
      : `${formatCurrency(v)}/m²`;

  const bands = [
    { color: "#e8e8e8", label: "Sem dados" },
    { color: PALETTE[0], label: `até ${fmt(breaks[1])}` },
    { color: PALETTE[1], label: `até ${fmt(breaks[2])}` },
    { color: PALETTE[2], label: `até ${fmt(breaks[3])}` },
    { color: PALETTE[3], label: `até ${fmt(breaks[4])}` },
    { color: PALETTE[4], label: `até ${fmt(breaks[5])}` },
    { color: PALETTE[5], label: `até ${fmt(breaks[6])}` },
    { color: PALETTE[6], label: `acima de ${fmt(breaks[6])}` },
  ];

  return (
    <div className="absolute bottom-6 left-3 z-[1000] rounded-lg border border-gray-200 bg-white/90 p-2 shadow-md dark:border-gray-600 dark:bg-gray-800/90">
      <p className="mb-1 text-xs font-semibold text-gray-600 dark:text-gray-300">
        Legenda
      </p>
      {bands.map((b) => (
        <div key={b.color + b.label} className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300">
          <span
            className="inline-block h-3 w-5 rounded-sm border border-gray-300"
            style={{ backgroundColor: b.color }}
          />
          {b.label}
        </div>
      ))}
    </div>
  );
}

export default function ChoroplethMap({
  geoJson,
  data,
  metric,
  title,
  loading,
}: Props) {
  const breaks = calcBreaks(data, metric);
  const dataKey = JSON.stringify(data) + metric;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function styleFeature(feature: any) {
    const nome: string = feature?.properties?.nome ?? "";
    const d = data[nome];
    const value = d ? (metric === "valor" ? d.median_valor : d.median_preco_m2) : null;
    return {
      fillColor: getColor(value, breaks),
      weight: 1,
      color: "#aaa",
      fillOpacity: 0.75,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function onEachFeature(feature: any, layer: any) {
    const nome: string = feature?.properties?.nome ?? "Desconhecido";
    const d = data[nome];

    let content = `<b>${nome}</b>`;
    if (d) {
      const val =
        metric === "valor"
          ? `Mediana: ${d.median_valor !== null ? formatCurrency(d.median_valor) : "–"}`
          : `Mediana: ${d.median_preco_m2 !== null ? formatCurrency(d.median_preco_m2) + "/m²" : "–"}`;
      content += `<br/>${val}<br/>${d.count} transações`;
    } else {
      content += "<br/>Sem dados";
    }

    layer.bindTooltip(content, { sticky: true });
    layer.on("mouseover", () =>
      layer.setStyle({ weight: 2, color: "#333", fillOpacity: 0.9 })
    );
    layer.on("mouseout", () =>
      layer.setStyle({ weight: 1, color: "#aaa", fillOpacity: 0.75 })
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{title}</h2>
      <div className="relative overflow-hidden rounded-xl shadow-lg">
        <MapContainer
          center={[-23.55, -46.63]}
          zoom={10}
          style={{ height: "480px", width: "100%" }}
          zoomControl={true}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {geoJson && (
            <GeoJSON
              key={dataKey}
              data={geoJson}
              style={styleFeature}
              onEachFeature={onEachFeature}
            />
          )}
        </MapContainer>

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 z-[2000] flex items-center justify-center rounded-xl bg-white/60 dark:bg-gray-900/60">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Carregando...
            </span>
          </div>
        )}

        {/* Legend */}
        {!loading && Object.keys(data).length > 0 && (
          <ColorLegend breaks={breaks} metric={metric} />
        )}
      </div>
    </div>
  );
}
