import SearchForm from "@/components/busca/search-form";

export default function BuscaPage() {
  return (
    <div className="min-h-[calc(100vh-57px)] bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          Busca por Endereco
        </h1>
        <p className="mb-2 text-gray-600 dark:text-gray-400">
          Digite o CEP e o número do imóvel para consultar o histórico real de
          transações registradas via ITBI na Prefeitura de São Paulo.
        </p>
        <p className="mb-8 text-sm text-gray-500 dark:text-gray-500">
          Exemplo: CEP <span className="font-medium text-gray-700 dark:text-gray-300">05510-020</span>, número <span className="font-medium text-gray-700 dark:text-gray-300">582</span>
        </p>
        <SearchForm />
      </div>
    </div>
  );
}
