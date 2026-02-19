"use client";

import dynamic from "next/dynamic";

const TendenciasContent = dynamic(
  () => import("@/components/tendencias/tendencias-content"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[calc(100vh-57px)] bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="mb-4 h-9 w-64 animate-pulse rounded-lg bg-gray-300 dark:bg-gray-700" />
          <div className="mb-6 h-5 w-96 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-600" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="h-[520px] animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
            <div className="h-[520px] animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      </div>
    ),
  }
);

export default function TendenciasPage() {
  return <TendenciasContent />;
}
