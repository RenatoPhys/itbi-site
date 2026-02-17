"use client";

import dynamic from "next/dynamic";

const MapContainer = dynamic(
  () => import("@/components/mapa/map-container"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[600px] w-full animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
    ),
  }
);

export default function MapaPage() {
  return (
    <div className="min-h-[calc(100vh-57px)] bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          Mapa Interativo
        </h1>
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          Mapa de transações imobiliárias (residenciais) REAIS da cidade de São Paulo.
          Selecione o ano para filtrar.
        </p>
        <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
          Esta pagina esta em fase de melhoria. Novos recursos e ajustes visuais serao implementados em breve.
        </div>
        <MapContainer />
      </div>
    </div>
  );
}
