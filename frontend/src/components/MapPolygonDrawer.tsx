import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, RefreshCw, Undo, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

interface MapPolygonDrawerProps {
  initialCenter?: [number, number];
  onPolygonComplete: (coords: [number, number][], centroid: [number, number], digipin: string, areaAcres: number) => void;
}

export const MapPolygonDrawer: React.FC<MapPolygonDrawerProps> = ({
  initialCenter = [12.602, 77.023], // Mandya, Karnataka agricultural belt
  onPolygonComplete
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const pointsLayerRef = useRef<L.LayerGroup | null>(null);
  const polygonLayerRef = useRef<L.Polygon | null>(null);

  const [points, setPoints] = useState<[number, number][]>([]);
  const [centroid, setCentroid] = useState<[number, number] | null>(null);
  const [digipinPreview, setDigipinPreview] = useState<string>('');
  const [digipinDisplay, setDigipinDisplay] = useState<string>('');
  const [calcArea, setCalcArea] = useState<number>(0);
  const [loadingDigipin, setLoadingDigipin] = useState<boolean>(false);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Initialize Leaflet map
    const map = L.map(mapContainerRef.current).setView(initialCenter, 15);
    mapInstanceRef.current = map;

    // OpenStreetMap standard tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const pointsLayer = L.layerGroup().addTo(map);
    pointsLayerRef.current = pointsLayer;

    // Click handler to draw vertices
    map.on('click', (e: L.LeafletMouseEvent) => {
      const newPoint: [number, number] = [e.latlng.lat, e.latlng.lng];
      setPoints((prev) => [...prev, newPoint]);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update polygon and points on map when points change
  useEffect(() => {
    if (!mapInstanceRef.current || !pointsLayerRef.current) return;

    pointsLayerRef.current.clearLayers();

    // Render vertex markers
    points.forEach((pt, idx) => {
      const marker = L.circleMarker(pt, {
        radius: 6,
        fillColor: '#14532D',
        color: '#FFFFFF',
        weight: 2,
        fillOpacity: 0.9
      });
      marker.bindTooltip(`Vertex ${idx + 1}: ${pt[0].toFixed(5)}, ${pt[1].toFixed(5)}`);
      pointsLayerRef.current?.addLayer(marker);
    });

    // Render polygon
    if (points.length >= 3) {
      if (polygonLayerRef.current) {
        polygonLayerRef.current.setLatLngs(points);
      } else {
        const poly = L.polygon(points, {
          color: '#14532D',
          weight: 3,
          fillColor: '#2E7D52',
          fillOpacity: 0.35
        }).addTo(mapInstanceRef.current);
        polygonLayerRef.current = poly;
      }

      // Calculate centroid
      const sumLat = points.reduce((acc, p) => acc + p[0], 0);
      const sumLon = points.reduce((acc, p) => acc + p[1], 0);
      const cLat = sumLat / points.length;
      const cLon = sumLon / points.length;
      setCentroid([cLat, cLon]);

      // Approximate acreage
      const cosLat = Math.cos((cLat * Math.PI) / 180);
      let areaSum = 0;
      for (let i = 0; i < points.length; i++) {
        const j = (i + 1) % points.length;
        const xi = points[i][1] * 111320 * cosLat;
        const yi = points[i][0] * 111320;
        const xj = points[j][1] * 111320 * cosLat;
        const yj = points[j][0] * 111320;
        areaSum += xi * yj - xj * yi;
      }
      const areaSqM = Math.abs(areaSum) / 2;
      const acres = Math.max(0.2, Number((areaSqM / 4046.86).toFixed(2)));
      setCalcArea(acres);

      // Fetch live DIGIPIN preview from backend
      setLoadingDigipin(true);
      api.encodeDigipin(cLat, cLon)
        .then((res) => {
          setDigipinPreview(res.digipin);
          setDigipinDisplay(res.display_format);
          onPolygonComplete(points, [cLat, cLon], res.digipin, acres);
        })
        .catch(() => {})
        .finally(() => setLoadingDigipin(false));
    } else {
      if (polygonLayerRef.current) {
        polygonLayerRef.current.remove();
        polygonLayerRef.current = null;
      }
      setCentroid(null);
      setDigipinPreview('');
      setDigipinDisplay('');
      setCalcArea(0);
    }
  }, [points]);

  const handleUndo = () => {
    setPoints((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPoints([]);
  };

  const handlePresetMandya = () => {
    // Preset demo field parcel in Mandya
    const sample: [number, number][] = [
      [12.6015, 77.0215],
      [12.6048, 77.0218],
      [12.6044, 77.0258],
      [12.6012, 77.0252]
    ];
    setPoints(sample);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([12.603, 77.023], 15);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-forest-100 text-forest-800 text-xs font-bold">
            {points.length}
          </span>
          <span className="text-xs font-medium text-slate-700">
            {points.length < 3 ? "Click on the map to place at least 3 corner boundary points" : `Polygon closed (${calcArea} Acres)`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePresetMandya}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
          >
            Load Sample Field
          </button>
          <button
            type="button"
            onClick={handleUndo}
            disabled={points.length === 0}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 disabled:opacity-40 transition"
          >
            <Undo className="w-3.5 h-3.5" />
            Undo
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={points.length === 0}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 disabled:opacity-40 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* Map viewport */}
      <div className="relative h-80 w-full rounded-2xl overflow-hidden border border-slate-300 shadow-inner">
        <div ref={mapContainerRef} className="h-full w-full" />

        {/* Live DIGIPIN Stamp Overlay */}
        {centroid && digipinPreview && (
          <div className="absolute bottom-3 left-3 right-3 z-[1000] bg-white/95 backdrop-blur-md p-3 rounded-xl border border-forest-600/30 shadow-lg flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-forest-800 text-white rounded-lg">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-forest-700">
                  Official India Post DIGIPIN (Centroid)
                </div>
                <div className="text-base font-extrabold text-navy-800 font-mono tracking-wide">
                  {loadingDigipin ? "Generating..." : digipinDisplay}
                </div>
              </div>
            </div>

            <div className="text-right text-xs text-slate-600">
              <div>Centroid: <span className="font-mono font-medium">{centroid[0].toFixed(5)}°N, {centroid[1].toFixed(5)}°E</span></div>
              <div>Area: <span className="font-bold text-forest-800">{calcArea} Acres</span> (~3.8m level-10 precision)</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
