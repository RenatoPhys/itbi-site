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
        <p className="mb-8 text-gray-600 dark:text-gray-400">
          Transacoes de ITBI em Sao Paulo. Selecione o ano para filtrar.
        </p>
        <MapContainer />
      </div>
    </div>
  );
}
