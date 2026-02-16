"use client";

import { createClient } from "@/lib/supabase-browser";
import { searchByCepNumero } from "@/lib/queries";
import { TransacaoITBI } from "@/lib/types";
import { useState } from "react";
import ScatterChart from "./scatter-chart";

export default function SearchForm() {
  const supabase = createClient();

  const [cep, setCep] = useState("");
  const [numero, setNumero] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TransacaoITBI[] | null>(null);
  const [error, setError] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResults(null);

    const cepNum = parseInt(cep.replace(/\D/g, ""), 10);
    const numNum = parseFloat(numero);

    if (isNaN(cepNum) || isNaN(numNum)) {
      setError("CEP e numero devem ser valores numericos.");
      setLoading(false);
      return;
    }

    try {
      const data = await searchByCepNumero(supabase, cepNum, numNum);
      setResults(data);
      if (data.length === 0) {
        setError("Nenhuma transacao encontrada para este endereco.");
      }
    } catch {
      setError("Erro ao buscar dados. Tente novamente.");
    }

    setLoading(false);
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="CEP (ex: 01232020)"
          value={cep}
          onChange={(e) => setCep(e.target.value)}
          required
          className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
        <input
          type="text"
          placeholder="Numero (ex: 87)"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
          required
          className="w-32 rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </form>

      {error && (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {results && results.length > 0 && (
        <div className="mt-8">
          <div className="mb-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {results[0].logradouro}, {results[0].numero}
              {results[0].complemento ? ` - ${results[0].complemento}` : ""}
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {results.length} transacoes encontradas
            </p>
          </div>
          <ScatterChart data={results} />
        </div>
      )}
    </div>
  );
}
