import SearchForm from "@/components/busca/search-form";

export default function BuscaPage() {
  return (
    <div className="min-h-[calc(100vh-57px)] bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          Busca por Endereco
        </h1>
        <p className="mb-8 text-gray-600 dark:text-gray-400">
          Digite o CEP e numero do imovel para consultar o historico de
          transacoes.
        </p>
        <SearchForm />
      </div>
    </div>
  );
}
