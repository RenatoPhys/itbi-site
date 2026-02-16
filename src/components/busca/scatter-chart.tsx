"use client";

import { TransacaoITBI } from "@/lib/types";
import {
  ScatterChart as RechartsScatter,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: TransacaoITBI[];
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("pt-BR", {
    month: "short",
    year: "numeric",
  });
}

export default function ScatterChart({ data }: Props) {
  const chartData = data.map((t) => ({
    date: new Date(t.data).getTime(),
    preco_m2: t.preco_m2,
    valor: t.valor,
    complemento: t.complemento || "",
    area: t.area_construida,
  }));

  return (
    <div className="rounded-xl bg-white p-6 shadow dark:bg-gray-900">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        Valor por m² ao longo do tempo
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <RechartsScatter data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            type="number"
            domain={["dataMin", "dataMax"]}
            tickFormatter={formatDate}
            name="Data"
          />
          <YAxis
            dataKey="preco_m2"
            type="number"
            tickFormatter={(v) => `R$${v.toFixed(0)}`}
            name="Preco/m²"
          />
          <Tooltip
            content={({ payload }) => {
              if (!payload || payload.length === 0) return null;
              const d = payload[0].payload;
              return (
                <div className="rounded-lg border bg-white p-3 shadow-lg dark:border-gray-600 dark:bg-gray-800">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {d.complemento}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Data: {formatDate(d.date)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Valor: {formatCurrency(d.valor)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Preco/m²: {formatCurrency(d.preco_m2)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Area: {d.area} m²
                  </p>
                </div>
              );
            }}
          />
          <Scatter dataKey="preco_m2" fill="#3b82f6" />
        </RechartsScatter>
      </ResponsiveContainer>
    </div>
  );
}
