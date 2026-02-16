export default function TendenciasPage() {
  return (
    <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
          <svg
            className="h-10 w-10 text-purple-600 dark:text-purple-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Tendencias
        </h1>
        <p className="mt-3 text-gray-600 dark:text-gray-400">
          Insights e analises sobre o mercado imobiliario.
        </p>
        <span className="mt-4 inline-block rounded-full bg-yellow-100 px-4 py-1 text-sm font-medium text-yellow-800">
          Em breve
        </span>
      </div>
    </div>
  );
}
