import Link from "next/link";

const stats = [
  { value: "+1 milhão", label: "de transações registradas" },
  { value: "20 anos", label: "de dados (2006–2025)" },
  { value: "Dados oficiais", label: "da Prefeitura de São Paulo" },
];

const featured = {
  href: "/busca",
  title: "Busca por Endereço",
  description:
    "Pesquise por CEP e número para ver o histórico completo de transações, a evolução do preço/m² e o valor de venda ao longo do tempo.",
};

const sections = [
  {
    href: "/mapa",
    title: "Mapa Interativo",
    description:
      "Visualize transações de ITBI no mapa de São Paulo com marcadores coloridos por faixa de preço, filtrados por ano.",
  },
  {
    href: "/tendencias",
    title: "Tendências",
    description:
      "Insights e análises sobre o mercado imobiliário paulistano. Em breve.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero */}
      <section className="px-4 pb-16 pt-20 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl dark:text-white">
          Radar Imobiliário SP
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-400">
          Consulte preços reais de transações imobiliárias na cidade de São Paulo com base 
          em dados oficiais de ITBI da Prefeitura de São Paulo.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/busca"
            className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Buscar endereço
          </Link>
          <Link
            href="/mapa"
            className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
          >
            Explorar mapa
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto grid max-w-4xl grid-cols-1 divide-y divide-gray-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0 dark:divide-gray-800">
          {stats.map((stat) => (
            <div key={stat.value} className="px-6 py-8 text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured: Busca */}
      <section className="px-4 pt-16 pb-8">
        <div className="mx-auto max-w-4xl">
          <Link
            href={featured.href}
            className="group block rounded-2xl border-2 border-blue-200 bg-blue-50 p-8 transition-all hover:border-blue-400 hover:shadow-lg dark:border-blue-900 dark:bg-blue-950/30 dark:hover:border-blue-700"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-lg text-white">
                &#128269;
              </span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {featured.title}
              </h3>
            </div>
            <p className="mt-3 text-base leading-relaxed text-gray-600 dark:text-gray-400">
              {featured.description}
            </p>
            <span className="mt-4 inline-block text-sm font-semibold text-blue-600 group-hover:underline dark:text-blue-400">
              Buscar agora &rarr;
            </span>
          </Link>
        </div>
      </section>

      {/* Other feature cards */}
      <section className="px-4 pb-16 pt-4">
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group rounded-xl border border-gray-200 p-6 transition-all hover:border-blue-200 hover:shadow-md dark:border-gray-800 dark:hover:border-blue-900"
            >
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {section.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {section.description}
              </p>
              <span className="mt-4 inline-block text-sm font-medium text-blue-600 group-hover:underline dark:text-blue-400">
                Acessar &rarr;
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Why real data matters */}
      <section className="px-4 pb-16">
        <div className="mx-auto max-w-3xl rounded-xl border border-emerald-200 bg-emerald-50 p-8 dark:border-emerald-800 dark:bg-emerald-950/30">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Por que dados reais de transação?
          </h3>
          <p className="mt-3 leading-relaxed text-gray-700 dark:text-gray-300">
            Preços anunciados em sites como QuintoAndar, Loft e ZAP podem ser{" "}
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
              até 30% superiores
            </span>{" "}
            ao valor efetivamente pago na escritura. Aqui você consulta o preço
            real registrado no ITBI — o imposto pago no momento da
            transferência do imóvel — refletindo o valor que comprador e
            vendedor de fato acordaram.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-4 py-6 text-center dark:border-gray-800">
        <p className="text-xs text-gray-400 dark:text-gray-600">
          Fonte: Secretaria Municipal da Fazenda — ITBI São Paulo
        </p>
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-600">
          Contato:{" "}
          <a
            href="mailto:mapa.imob.sp@gmail.com"
            className="underline hover:text-blue-500"
          >
            mapa.imob.sp@gmail.com
          </a>
        </p>
      </footer>
    </div>
  );
}
