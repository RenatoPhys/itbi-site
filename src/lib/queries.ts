import { SupabaseClient } from "@supabase/supabase-js";
import { MapBounds, MapPoint, TransacaoITBI } from "./types";

export async function getDistinctYears(
  supabase: SupabaseClient
): Promise<number[]> {
  const { data } = await supabase.from("transacoes_itbi").select("anomes");

  if (!data) return [];

  const years = [...new Set(data.map((d) => Math.floor(d.anomes / 100)))];
  return years.sort((a, b) => b - a);
}

export async function getMapPoints(
  supabase: SupabaseClient,
  year: number,
  bounds: MapBounds
): Promise<MapPoint[]> {
  const { data } = await supabase
    .from("transacoes_itbi")
    .select("logradouro, numero, cep, latitude, longitude, valor, preco_m2")
    .gte("anomes", year * 100 + 1)
    .lte("anomes", year * 100 + 12)
    .not("latitude", "is", null)
    .gte("latitude", bounds.south)
    .lte("latitude", bounds.north)
    .gte("longitude", bounds.west)
    .lte("longitude", bounds.east);

  if (!data) return [];

  const grouped = new Map<
    string,
    {
      lat: number;
      lng: number;
      logradouro: string;
      numero: number;
      cep: number | null;
      valores: number[];
      precos: number[];
    }
  >();

  for (const row of data) {
    const key = `${row.logradouro}|${row.numero}`;
    if (!grouped.has(key)) {
      grouped.set(key, {
        lat: row.latitude,
        lng: row.longitude,
        logradouro: row.logradouro,
        numero: row.numero,
        cep: row.cep,
        valores: [],
        precos: [],
      });
    }
    grouped.get(key)!.valores.push(row.valor);
    grouped.get(key)!.precos.push(row.preco_m2);
  }

  return Array.from(grouped.values()).map((g) => ({
    logradouro: g.logradouro,
    numero: g.numero,
    cep: g.cep,
    latitude: g.lat,
    longitude: g.lng,
    avg_valor: g.valores.reduce((a, b) => a + b, 0) / g.valores.length,
    avg_preco_m2: g.precos.reduce((a, b) => a + b, 0) / g.precos.length,
    count: g.valores.length,
  }));
}

export async function searchByCepNumero(
  supabase: SupabaseClient,
  cep: number,
  numero: number
): Promise<TransacaoITBI[]> {
  const { data, error } = await supabase
    .from("transacoes_itbi")
    .select("*")
    .eq("cep", cep)
    .eq("numero", numero)
    .order("data", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
