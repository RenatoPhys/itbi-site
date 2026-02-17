"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPoint, MapBounds } from "@/lib/types";
import { createClient } from "@/lib/supabase-browser";
import { getDistinctYears, getMapPoints } from "@/lib/queries";
import { useEffect, useState, useCallback, useRef } from "react";
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

function getValueColor(valor: number): string {
  if (valor < 300000) return "#22c55e";      // green
  if (valor < 600000) return "#eab308";      // yellow
  if (valor < 1000000) return "#f97316";     // orange
  return "#ef4444";                          // red
}

function createColoredIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="
      background-color: ${color};
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 1px 4px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createClusterIcon(cluster: any) {
  const count = cluster.getChildCount();
  let size = "small";
  let diameter = 36;
  if (count >= 100) {
    size = "large";
    diameter = 50;
  } else if (count >= 10) {
    size = "medium";
    diameter = 42;
  }

  const colors: Record<string, string> = {
    small: "#3b82f6",
    medium: "#8b5cf6",
    large: "#ef4444",
  };

  return L.divIcon({
    className: "",
    html: `<div style="
      background-color: ${colors[size]};
      width: ${diameter}px;
      height: ${diameter}px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: ${size === "large" ? 14 : 12}px;
      border: 3px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    ">${count}</div>`,
    iconSize: [diameter, diameter],
    iconAnchor: [diameter / 2, diameter / 2],
  });
}

function MapEvents({
  onBoundsChange,
}: {
  onBoundsChange: (bounds: MapBounds) => void;
}) {
  const map = useMapEvents({
    moveend: () => {
      const b = map.getBounds();
      onBoundsChange({
        north: b.getNorth(),
        south: b.getSouth(),
        east: b.getEast(),
        west: b.getWest(),
      });
    },
    zoomend: () => {
      const b = map.getBounds();
      onBoundsChange({
        north: b.getNorth(),
        south: b.getSouth(),
        east: b.getEast(),
        west: b.getWest(),
      });
    },
  });
  return null;
}

const SP_BOUNDS: MapBounds = {
  north: -23.35,
  south: -23.85,
  east: -46.35,
  west: -46.90,
};

export default function MapContainerComponent() {
  const supabase = createClient();

  const [years, setYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(0);
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [bounds, setBounds] = useState<MapBounds>(SP_BOUNDS);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const yrs = getDistinctYears();
    setYears(yrs);
    if (yrs.length > 0) {
      setSelectedYear(yrs[0]);
    }
  }, []);

  const loadPoints = useCallback(
    (year: number, b: MapBounds) => {
      if (year === 0) return;
      setLoading(true);
      getMapPoints(supabase, year, b).then((pts) => {
        setPoints(pts);
        setLoading(false);
      });
    },
    [supabase]
  );

  useEffect(() => {
    loadPoints(selectedYear, bounds);
  }, [selectedYear]);

  function handleBoundsChange(newBounds: MapBounds) {
    setBounds(newBounds);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadPoints(selectedYear, newBounds);
    }, 400);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <YearSelector
          years={years}
          selectedYear={selectedYear}
          onChange={setSelectedYear}
        />
        <div className="flex items-center gap-4">
          {loading ? (
            <span className="text-sm text-gray-500">Carregando...</span>
          ) : (
            <span className="text-sm text-gray-500">
              {points.length} endereco(s)
            </span>
          )}
          <div className="hidden items-center gap-2 text-xs text-gray-400 sm:flex">
            <span className="inline-block h-3 w-3 rounded-full bg-green-500" /> &lt;300k
            <span className="inline-block h-3 w-3 rounded-full bg-yellow-500" /> 300-600k
            <span className="inline-block h-3 w-3 rounded-full bg-orange-500" /> 600k-1M
            <span className="inline-block h-3 w-3 rounded-full bg-red-500" /> &gt;1M
            <span className="ml-1">R$</span>
          </div>
        </div>
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
          <MapEvents onBoundsChange={handleBoundsChange} />
          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={60}
            spiderfyOnMaxZoom
            showCoverageOnHover={false}
            iconCreateFunction={createClusterIcon}
          >
            {points.map((point, i) => (
              <Marker
                key={`${point.logradouro}-${point.numero}-${i}`}
                position={[point.latitude, point.longitude]}
                icon={createColoredIcon(getValueColor(point.avg_valor))}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-semibold">
                      {point.logradouro}, {point.numero}
                    </p>
                    <p>Valor medio: {formatCurrency(point.avg_valor)}</p>
                    <p>Preco/m² medio: {formatCurrency(point.avg_preco_m2)}</p>
                    <p>
                      {point.count} transacao(oes) em {selectedYear}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
    </div>
  );
}
