import { createClient } from "@/lib/supabase-server";
import Link from "next/link";
import LogoutButton from "./logout-button";

const sections = [
  {
    href: "/mapa",
    title: "Mapa Interativo",
    description: "Visualize transacoes de ITBI no mapa de Sao Paulo, filtradas por ano.",
    color: "bg-blue-100 text-blue-800",
  },
  {
    href: "/busca",
    title: "Busca por Endereco",
    description: "Pesquise por CEP e numero para ver o historico de transacoes do imovel.",
    color: "bg-green-100 text-green-800",
  },
  {
    href: "/tendencias",
    title: "Tendencias",
    description: "Insights e analises sobre o mercado imobiliario. Em breve.",
    color: "bg-purple-100 text-purple-800",
  },
];

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            ITBI - Sao Paulo
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
            Sistema de consulta de transacoes imobiliarias
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group rounded-2xl bg-white p-6 shadow-md transition-all hover:shadow-lg dark:bg-gray-900"
            >
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${section.color}`}
              >
                {section.title}
              </span>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                {section.description}
              </p>
              <span className="mt-4 inline-block text-sm font-medium text-blue-600 group-hover:underline dark:text-blue-400">
                Acessar →
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          {user ? (
            <div className="inline-flex items-center gap-4 rounded-xl bg-white px-6 py-3 shadow dark:bg-gray-900">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {user.email}
              </span>
              <LogoutButton />
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-block rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Entrar / Criar conta
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
