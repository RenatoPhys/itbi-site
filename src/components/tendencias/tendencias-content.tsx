"use client";

import { useEffect, useState } from "react";
import type { FeatureCollection } from "geojson";
import { createClient } from "@/lib/supabase-browser";
import { getMedianasPorDistrito } from "@/lib/queries";
import { DistritoMediana } from "@/lib/types";
import ChoroplethMap from "./choropleth-map";
import YearSelector from "@/components/mapa/year-selector";

const YEARS = [2025, 2024, 2023, 2022, 2021, 2020];

export default function TendenciasContent() {
  const supabase = createClient();
  const [selectedYear, setSelectedYear] = useState(2025);
  const [loading, setLoading] = useState(true);
  const [geoJson, setGeoJson] = useState<FeatureCollection | null>(null);
  const [data, setData] = useState<Record<string, DistritoMediana>>({});
  const [geoError, setGeoError] = useState(false);

  // Carrega GeoJSON dos distritos (uma vez)
  useEffect(() => {
    fetch("/distritos-sp.json")
      .then((r) => {
        if (!r.ok) throw new Error("GeoJSON não encontrado");
        return r.json();
      })
      .then((json) => setGeoJson(json))
      .catch(() => setGeoError(true));
  }, []);

  // Carrega medianas ao mudar o ano
  useEffect(() => {
    setLoading(true);
    getMedianasPorDistrito(supabase, selectedYear)
      .then((d) => setData(d))
      .catch((err) => console.error("Erro RPC:", err))
      .finally(() => setLoading(false));
  }, [selectedYear]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalDistritos = Object.keys(data).length;
  const totalTransacoes = Object.values(data).reduce((s, d) => s + d.count, 0);

  return (
    <div className="min-h-[calc(100vh-57px)] bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-7xl px-4 py-10">

        {/* Cabeçalho */}
        <h1 className="mb-1 text-3xl font-bold text-gray-900 dark:text-white">
          Tendências do Mercado
        </h1>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Valores medianos por distrito oficial de São Paulo · dados reais de ITBI
        </p>

        {/* Filtro de ano */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <YearSelector
            years={YEARS}
            selectedYear={selectedYear}
            onChange={setSelectedYear}
          />
          {!loading && totalDistritos > 0 && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {totalDistritos} distritos · {totalTransacoes.toLocaleString("pt-BR")} transações
            </span>
          )}
        </div>

        {/* Aviso se GeoJSON não foi carregado */}
        {geoError && (
          <div className="mb-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300">
            Arquivo <code>public/distritos-sp.json</code> não encontrado.
            Execute <code>python supabase/gerar_distritos_sp.py</code> para gerá-lo.
          </div>
        )}

        {/* Dois mapas lado a lado */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChoroplethMap
            geoJson={geoJson}
            data={data}
            metric="valor"
            title="Valor Mediano das Transações"
            loading={loading}
          />
          <ChoroplethMap
            geoJson={geoJson}
            data={data}
            metric="preco_m2"
            title="Preço Mediano por m²"
            loading={loading}
          />
        </div>

        {/* Nota de rodapé */}
        <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
          Fonte: Declarações de ITBI do Município de São Paulo · Cálculo: mediana por distrito por ano.
        </p>
      </div>
    </div>
  );
}
