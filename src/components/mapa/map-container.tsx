"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPoint } from "@/lib/types";
import { createClient } from "@/lib/supabase-browser";
import { getDistinctYears, getMapPoints } from "@/lib/queries";
import { useEffect, useState } from "react";
import YearSelector from "./year-selector";

// Fix Leaflet default marker icons
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

export default function MapContainerComponent() {
  const supabase = createClient();

  const [years, setYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(0);
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDistinctYears(supabase).then((yrs) => {
      setYears(yrs);
      if (yrs.length > 0) {
        setSelectedYear(yrs[0]);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedYear === 0) return;
    setLoading(true);
    getMapPoints(supabase, selectedYear).then((pts) => {
      setPoints(pts);
      setLoading(false);
    });
  }, [selectedYear]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <YearSelector
          years={years}
          selectedYear={selectedYear}
          onChange={setSelectedYear}
        />
        {loading ? (
          <span className="text-sm text-gray-500">Carregando...</span>
        ) : (
          <span className="text-sm text-gray-500">
            {points.length} endereco(s)
          </span>
        )}
      </div>

      <div className="overflow-hidden rounded-xl shadow-lg">
        <MapContainer
          center={[-23.55, -46.63]}
          zoom={11}
          style={{ height: "600px", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {points.map((point, i) => (
            <Marker key={i} position={[point.latitude, point.longitude]}>
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">
                    {point.logradouro}, {point.numero}
                  </p>
                  <p>Valor medio: {formatCurrency(point.avg_valor)}</p>
                  <p>Preco/m² medio: {formatCurrency(point.avg_preco_m2)}</p>
                  <p>{point.count} transacao(oes) em {selectedYear}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
