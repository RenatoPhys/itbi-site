export interface TransacaoITBI {
  id: number;
  id_original: number;
  anomes: number;
  valor: number;
  data: string;
  sql_setor_quadra_lote: string;
  logradouro: string;
  numero: number;
  complemento: string | null;
  natureza_transacao: string;
  area_construida: number;
  preco_m2: number;
  created_at: string;
  cep: number | null;
  latitude: number | null;
  longitude: number | null;
}

export interface MapPoint {
  logradouro: string;
  numero: number;
  latitude: number;
  longitude: number;
  avg_valor: number;
  avg_preco_m2: number;
  count: number;
  cep: number | null;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}
