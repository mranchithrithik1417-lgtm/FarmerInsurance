import React, { useState, useRef, useEffect, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  Crosshair,
  Layers,
  Sparkles,
  Info,
  Maximize2,
  LocateFixed,
  Compass
} from 'lucide-react';
import { encodeDigipin } from '../../utils/digipin';
import {
  calculatePolygonAreaAcres,
  calculatePolygonCentroid,
  calculateEdgeDistances,
  generateDefaultParcelCoordinates,
  haversineDistanceMeters
} from '../../utils/geo';
import { b, t } from '../../utils/translations';

interface LandPlotMapSelectorProps {
  initialCenterLat?: number;
  initialCenterLon?: number;
  initialCoords?: [number, number][];
  surveyNumber?: string;
  language?: 'en' | 'kn';
  onPlotChange?: (data: {
    coords: [number, number][];
    areaAcres: number;
    centroidLat: number;
    centroidLon: number;
    digipin: string;
  }) => void;
}

export const LandPlotMapSelector: React.FC<LandPlotMapSelectorProps> = ({
  initialCenterLat = 13.2456,
  initialCenterLon = 77.7123,
  initialCoords,
  surveyNumber = '125/2',
  language = 'en',
  onPlotChange
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const polygonLayerRef = useRef<L.Polygon | null>(null);
  const digipinSquareRef = useRef<L.Rectangle | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const edgeDistanceMarkersRef = useRef<L.Marker[]>([]);
  const centroidMarkerRef = useRef<L.Marker | null>(null);

  // Active satellite tile provider
  const [satelliteProvider, setSatelliteProvider] = useState<'esri' | 'google'>('esri');
  const [activeCornerIdx, setActiveCornerIdx] = useState<number | null>(null);
  const [isMapReady, setIsMapReady] = useState<boolean>(false);

  // Polygon coordinates [[lat, lon], ...]
  const [coords, setCoords] = useState<[number, number][]>(() => {
    if (initialCoords && initialCoords.length >= 3) {
      return initialCoords;
    }
    return generateDefaultParcelCoordinates(initialCenterLat, initialCenterLon);
  });

  // Ref tracking current coordinates for drag handlers without triggering re-render churn
  const coordsRef = useRef<[number, number][]>(coords);
  coordsRef.current = coords;
  const isDraggingRef = useRef<boolean>(false);

  // Live HUD metrics during dragging
  const [liveAreaAcres, setLiveAreaAcres] = useState<number>(() => calculatePolygonAreaAcres(coords));
  const [liveCentroid, setLiveCentroid] = useState<[number, number]>(() => calculatePolygonCentroid(coords));
  const [liveDigipin, setLiveDigipin] = useState<string>(() => {
    const c = calculatePolygonCentroid(coords);
    return encodeDigipin(c[0], c[1]);
  });
  const [livePerimeterMeters, setLivePerimeterMeters] = useState<number>(() => {
    const dists = calculateEdgeDistances(coords);
    return dists.reduce((a, b) => a + b, 0);
  });

  // Update live metrics when coords state updates
  useEffect(() => {
    const c = calculatePolygonCentroid(coords);
    const a = calculatePolygonAreaAcres(coords);
    const d = encodeDigipin(c[0], c[1]);
    const ed = calculateEdgeDistances(coords);
    const perim = ed.reduce((acc, curr) => acc + curr, 0);

    setLiveCentroid(c);
    setLiveAreaAcres(a);
    setLiveDigipin(d);
    setLivePerimeterMeters(perim);

    if (onPlotChange) {
      onPlotChange({
        coords,
        areaAcres: a,
        centroidLat: c[0],
        centroidLon: c[1],
        digipin: d
      });
    }
  }, [coords, onPlotChange]);

  // Create custom Leaflet DIV Icon for corner pins
  const createPinIcon = (index: number, isActive: boolean = false) => {
    return L.divIcon({
      className: 'leaflet-custom-marker',
      html: `
        <div style="
          width: 32px;
          height: 32px;
          background: ${isActive ? '#38bdf8' : '#10b981'};
          color: #020617;
          border: 2.5px solid #ffffff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 11px;
          font-family: ui-monospace, monospace;
          box-shadow: 0 4px 14px rgba(0,0,0,0.7), 0 0 ${isActive ? '15px #38bdf8' : '10px #10b981'};
          cursor: grab;
          touch-action: none;
          transition: transform 0.15s ease, background 0.15s ease;
          transform: ${isActive ? 'scale(1.25)' : 'scale(1)'};
          user-select: none;
        ">
          P${index + 1}
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
  };

  // Create edge distance midpoint label icon
  const createDistanceIcon = (meters: number) => {
    return L.divIcon({
      className: 'leaflet-dist-badge',
      html: `
        <div style="
          background: rgba(2, 6, 23, 0.92);
          backdrop-filter: blur(4px);
          color: #6ee7b7;
          border: 1px solid rgba(16, 185, 129, 0.6);
          border-radius: 6px;
          padding: 1.5px 6px;
          font-size: 9px;
          font-weight: 700;
          font-family: ui-monospace, monospace;
          white-space: nowrap;
          box-shadow: 0 2px 6px rgba(0,0,0,0.5);
          transform: translate(-50%, -50%);
          pointer-events: none;
          user-select: none;
        ">
          ${meters}m
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });
  };

  // Create Centroid DIGIPIN Reticle Icon
  const createDigipinReticleIcon = (code: string) => {
    return L.divIcon({
      className: 'leaflet-digipin-reticle',
      html: `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          transform: translate(-50%, -50%);
          pointer-events: none;
          user-select: none;
        ">
          <div style="
            width: 32px;
            height: 32px;
            border: 2px dashed #22d3ee;
            background: rgba(6, 182, 212, 0.25);
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 15px rgba(6, 182, 212, 0.7);
          ">
            <div style="width: 6px; height: 6px; background: #ffffff; border-radius: 50%;"></div>
          </div>
          <div style="
            margin-top: 4px;
            background: rgba(2, 6, 23, 0.95);
            border: 1px solid rgba(6, 182, 212, 0.7);
            border-radius: 6px;
            padding: 2px 6px;
            color: #67e8f9;
            font-size: 9px;
            font-weight: 800;
            font-family: ui-monospace, monospace;
            white-space: nowrap;
            box-shadow: 0 4px 10px rgba(0,0,0,0.6);
          ">
            DIGIPIN: ${code}
          </div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });
  };

  // Update edge distance badges positions & labels
  const updateEdgeBadges = useCallback((currentPts: [number, number][], map: L.Map) => {
    const n = currentPts.length;

    // Adjust badge marker count if needed
    while (edgeDistanceMarkersRef.current.length < n) {
      const distMarker = L.marker([0, 0], {
        icon: createDistanceIcon(0),
        interactive: false
      }).addTo(map);
      edgeDistanceMarkersRef.current.push(distMarker);
    }
    while (edgeDistanceMarkersRef.current.length > n) {
      const m = edgeDistanceMarkersRef.current.pop();
      m?.remove();
    }

    for (let i = 0; i < n; i++) {
      const nextIdx = (i + 1) % n;
      const p1 = currentPts[i];
      const p2 = currentPts[nextIdx];
      const midLat = (p1[0] + p2[0]) / 2;
      const midLon = (p1[1] + p2[1]) / 2;
      const dist = Math.round(haversineDistanceMeters(p1[0], p1[1], p2[0], p2[1]));

      const marker = edgeDistanceMarkersRef.current[i];
      marker.setLatLng([midLat, midLon]);
      marker.setIcon(createDistanceIcon(dist));
    }
  }, []);

  // Update DIGIPIN 4x4m square and centroid reticle
  const updateCentroidAndDigipin = useCallback((currentPts: [number, number][], map: L.Map) => {
    const c = calculatePolygonCentroid(currentPts);
    const code = encodeDigipin(c[0], c[1]);

    const dLat = 4.0 / 110574.0;
    const dLon = 4.0 / (111320.0 * Math.cos((c[0] * Math.PI) / 180.0));
    const bounds: L.LatLngBoundsExpression = [
      [c[0] - dLat / 2, c[1] - dLon / 2],
      [c[0] + dLat / 2, c[1] + dLon / 2]
    ];

    if (!digipinSquareRef.current) {
      digipinSquareRef.current = L.rectangle(bounds, {
        color: '#06b6d4',
        weight: 2,
        fillColor: '#06b6d4',
        fillOpacity: 0.35,
        dashArray: '3, 3'
      }).addTo(map);
    } else {
      digipinSquareRef.current.setBounds(bounds);
    }

    if (!centroidMarkerRef.current) {
      centroidMarkerRef.current = L.marker([c[0], c[1]], {
        icon: createDigipinReticleIcon(code),
        interactive: false
      }).addTo(map);
    } else {
      centroidMarkerRef.current.setLatLng([c[0], c[1]]);
      centroidMarkerRef.current.setIcon(createDigipinReticleIcon(code));
    }
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on initial coordinates at zoom level 18
    const map = L.map(mapContainerRef.current, {
      center: [initialCenterLat, initialCenterLon],
      zoom: 18,
      maxZoom: 19,
      minZoom: 13,
      zoomControl: false,
      attributionControl: false
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    const tileUrl =
      satelliteProvider === 'esri'
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        : 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';

    const tiles = L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution: 'Esri World Imagery / Google Satellite'
    }).addTo(map);

    tileLayerRef.current = tiles;
    mapInstanceRef.current = map;
    setIsMapReady(true);

    // Call invalidateSize after slight mount delay
    const resizeTimer1 = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    const resizeTimer2 = setTimeout(() => {
      map.invalidateSize();
    }, 450);

    // Handle container resize automatically
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      clearTimeout(resizeTimer1);
      clearTimeout(resizeTimer2);
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Switch Satellite Tile Layer when provider toggled
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    const tileUrl =
      satelliteProvider === 'esri'
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        : 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';

    tileLayerRef.current.setUrl(tileUrl);
  }, [satelliteProvider]);

  // Recenter map when initialCenterLat or initialCenterLon changes significantly
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const currentCenter = mapInstanceRef.current.getCenter();
    const dist = haversineDistanceMeters(
      currentCenter.lat,
      currentCenter.lng,
      initialCenterLat,
      initialCenterLon
    );

    if (dist > 20) {
      mapInstanceRef.current.flyTo([initialCenterLat, initialCenterLon], 18, {
        duration: 1.0
      });
      const newPts = generateDefaultParcelCoordinates(initialCenterLat, initialCenterLon);
      setCoords(newPts);
    }
  }, [initialCenterLat, initialCenterLon]);

  // Render & Synchronize Map Elements (Polygon, Markers, Badges)
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady) return;
    const map = mapInstanceRef.current;

    // 1. Polygon Layer
    if (!polygonLayerRef.current) {
      polygonLayerRef.current = L.polygon(coords, {
        color: '#10b981',
        weight: 2.5,
        fillColor: '#10b981',
        fillOpacity: 0.24,
        dashArray: '6, 4'
      }).addTo(map);
    } else {
      polygonLayerRef.current.setLatLngs(coords);
    }

    // 2. Draggable Corner Markers
    // If marker count matches coords length and not dragging, update positions without re-instantiating!
    if (markersRef.current.length === coords.length) {
      coords.forEach((pt, idx) => {
        const marker = markersRef.current[idx];
        if (marker && !isDraggingRef.current) {
          marker.setLatLng(pt);
          marker.setIcon(createPinIcon(idx, activeCornerIdx === idx));
        }
      });
    } else {
      // Re-create markers if count changed (e.g. Add Corner)
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      coords.forEach((pt, idx) => {
        const marker = L.marker(pt, {
          draggable: true,
          icon: createPinIcon(idx, activeCornerIdx === idx),
          autoPan: true
        }).addTo(map);

        marker.on('dragstart', () => {
          isDraggingRef.current = true;
          setActiveCornerIdx(idx);
          marker.setIcon(createPinIcon(idx, true));
        });

        // On dragging pin: update polygon, edge badges, and HUD directly without tearing down markers!
        marker.on('drag', () => {
          const newLatLng = marker.getLatLng();
          const lat = Number(newLatLng.lat.toFixed(6));
          const lng = Number(newLatLng.lng.toFixed(6));

          coordsRef.current[idx] = [lat, lng];

          if (polygonLayerRef.current) {
            polygonLayerRef.current.setLatLngs(coordsRef.current);
          }

          updateEdgeBadges(coordsRef.current, map);
          updateCentroidAndDigipin(coordsRef.current, map);

          // Fast live metrics update
          const a = calculatePolygonAreaAcres(coordsRef.current);
          const c = calculatePolygonCentroid(coordsRef.current);
          const d = encodeDigipin(c[0], c[1]);
          const ed = calculateEdgeDistances(coordsRef.current);
          const p = ed.reduce((acc, curr) => acc + curr, 0);

          setLiveAreaAcres(a);
          setLiveCentroid(c);
          setLiveDigipin(d);
          setLivePerimeterMeters(p);
        });

        marker.on('dragend', () => {
          isDraggingRef.current = false;
          setActiveCornerIdx(null);
          marker.setIcon(createPinIcon(idx, false));

          // Commit final positions to React state
          setCoords([...coordsRef.current]);
        });

        markersRef.current.push(marker);
      });
    }

    // 3. Update Edge Badges & Centroid DIGIPIN
    updateEdgeBadges(coords, map);
    updateCentroidAndDigipin(coords, map);
  }, [coords, isMapReady, activeCornerIdx, updateEdgeBadges, updateCentroidAndDigipin]);

  // Recenter on plot
  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([liveCentroid[0], liveCentroid[1]], 18, {
      duration: 0.8
    });
  };

  // Reset to default standard boundary
  const handleReset = () => {
    const defaultPoints = generateDefaultParcelCoordinates(liveCentroid[0], liveCentroid[1]);
    coordsRef.current = defaultPoints;
    setCoords(defaultPoints);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([liveCentroid[0], liveCentroid[1]], 18, {
        duration: 0.6
      });
    }
  };

  // Add a corner point
  const handleAddPoint = () => {
    if (coords.length >= 8) return;
    const p1 = coords[0];
    const p2 = coords[1];
    const midLat = Number(((p1[0] + p2[0]) / 2 + 0.0002).toFixed(6));
    const midLon = Number(((p1[1] + p2[1]) / 2 + 0.0001).toFixed(6));
    const newCoords: [number, number][] = [coords[0], [midLat, midLon], ...coords.slice(1)];
    coordsRef.current = newCoords;
    setCoords(newCoords);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
      {/* Top Header & Map Controls */}
      <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
            <Layers className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                {b('Live Satellite Plot Boundary Selector', 'ಲೈವ್ ಉಪಗ್ರಹ ಜಮೀನಿನ ಗಡಿ ಆಯ್ಕೆಗಾರ', language)}
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-800 font-mono px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
                {b('LIVE SATELLITE TILES • ZOOM 18', 'ಲೈವ್ ಉಪಗ್ರಹ ಚಿತ್ರಣ • ಜೂಮ್ 18', language)}
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              {b(
                'Drag green pins (P1–P4) directly onto your real farm parcel visible from space.',
                'ಅಂತರಿಕ್ಷದಿಂದ ಕಾಣುವ ನಿಮ್ಮ ನೈಜ ಜಮೀನಿನ ಬದುಗಳ ಮೇಲೆ ಹಸಿರು ಪಿನ್ (P1–P4) ಗಳನ್ನು ಎಳೆಯಿರಿ.',
                language
              )}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleAddPoint}
            disabled={coords.length >= 8}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 text-[11px] font-semibold rounded-lg flex items-center gap-1 border border-slate-200 transition cursor-pointer shadow-sm"
            title="Add boundary corner point"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-700" />
            <span>{b('Add Corner', 'ಮೂಲೆ ಸೇರಿಸಿ', language)}</span>
          </button>

          <button
            type="button"
            onClick={handleRecenter}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-semibold rounded-lg flex items-center gap-1 border border-slate-200 transition cursor-pointer shadow-sm"
            title="Recenter view on plot"
          >
            <LocateFixed className="w-3.5 h-3.5 text-emerald-700" />
            <span>{b('Recenter', 'ಮಧ್ಯಕ್ಕೆ ತನ್ನಿ', language)}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-semibold rounded-lg flex items-center gap-1 border border-slate-200 transition cursor-pointer shadow-sm"
            title="Reset to survey standard boundary"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
            <span>{b('Reset', 'ಮರುಹೊಂದಿಸಿ', language)}</span>
          </button>

          {/* Satellite Layer Provider Switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px]">
            <button
              type="button"
              onClick={() => setSatelliteProvider('esri')}
              className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                satelliteProvider === 'esri'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {b('Esri Satellite', 'ಎಸ್ರಿ ಉಪಗ್ರಹ', language)}
            </button>
            <button
              type="button"
              onClick={() => setSatelliteProvider('google')}
              className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                satelliteProvider === 'google'
                  ? 'bg-sky-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {b('Google Hybrid', 'ಗೂಗಲ್ ಹೈಬ್ರಿಡ್', language)}
            </button>
          </div>
        </div>
      </div>

      {/* Real Dynamic Satellite Map Canvas */}
      <div className="relative w-full h-[380px] sm:h-[420px] select-none bg-slate-950 overflow-hidden">
        <div ref={mapContainerRef} className="w-full h-full z-0 cursor-crosshair" />

        {/* Top-Left Cadastral HUD Overlay */}
        <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-md border border-slate-200 px-3 py-1.5 rounded-xl z-10 text-[10px] space-y-0.5 shadow-md pointer-events-none">
          <div className="flex items-center gap-1.5 font-bold text-slate-900">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{b('Cadastral Survey #', 'ಕಂದಾಯ ಸರ್ವೆ ಸಂಖ್ಯೆ #', language)}{surveyNumber}</span>
            <span className="text-emerald-700 font-mono font-bold">({liveAreaAcres} {b('ac', 'ಎಕರೆ', language)})</span>
          </div>
          <div className="text-slate-600 font-mono text-[9px]">
            GPS: {liveCentroid[0].toFixed(5)}°N, {liveCentroid[1].toFixed(5)}°E
          </div>
        </div>

        {/* Top-Right Drag Status Pill */}
        <div className="absolute top-2.5 right-12 bg-white/95 backdrop-blur-md border border-slate-200 px-2.5 py-1 rounded-xl z-10 text-[10px] flex items-center gap-1.5 shadow-md pointer-events-none">
          <span className="text-emerald-800 font-medium">
            {activeCornerIdx !== null
              ? b(`Dragging Corner P${activeCornerIdx + 1}...`, `ಮೂಲೆ P${activeCornerIdx + 1} ಎಳೆಯಲಾಗುತ್ತಿದೆ...`, language)
              : b('Drag pins P1–P4 to align with farm bunds', 'ಜಮೀನಿನ ಬದುಗಳಿಗೆ ಹೊಂದಿಸಲು P1–P4 ಪಿನ್‌ಗಳನ್ನು ಎಳೆಯಿರಿ', language)}
          </span>
        </div>

        {/* Bottom Real-Time Telemetry Bar */}
        <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-md border border-slate-200 px-3 py-2 rounded-xl z-10 flex flex-wrap items-center justify-between gap-2 text-xs shadow-lg">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-[10px] text-slate-500 block font-medium">{b('Marked Land Area', 'ಗುರುತಿಸಲಾದ ಭೂ ವಿಸ್ತೀರ್ಣ', language)}</span>
              <span className="font-extrabold text-emerald-800 font-mono text-sm">
                {liveAreaAcres} {b('Acres', 'ಎಕರೆ', language)}
              </span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="text-[10px] text-slate-500 block font-medium">{b('Perimeter Bunds', 'ಸುತ್ತಳತೆ ಬದುಗಳು', language)}</span>
              <span className="font-mono text-slate-800 text-[11px] font-semibold">
                {livePerimeterMeters}m ({coords.length} {b('corners', 'ಮೂಲೆಗಳು', language)})
              </span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="text-[10px] text-slate-500 block font-medium">{b('National DIGIPIN', 'ರಾಷ್ಟ್ರೀಯ ಡಿಜಿಪಿನ್', language)}</span>
              <span className="font-mono text-emerald-800 font-bold text-[11px]">
                {liveDigipin}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-emerald-800 text-[11px] font-semibold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>{b('4m×4m National Grid Cell Locked', '4ಮೀ×4ಮೀ ರಾಷ್ಟ್ರೀಯ ಗ್ರಿಡ್ ಲಾಕ್ ಆಗಿದೆ', language)}</span>
          </div>
        </div>
      </div>

      {/* Guidance Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <Info className="w-4 h-4 text-emerald-700 flex-shrink-0" />
          <span>
            {b(
              'Click and drag pins P1–P4 along the visible physical field bunds to define your exact farm parcel boundary.',
              'ನಿಮ್ಮ ಕೃಷಿ ಜಮೀನಿನ ನಿಖರ ಗಡಿಯನ್ನು ನಿರ್ಧರಿಸಲು ಗೋಚರಿಸುವ ಬದುಗಳ ಮೇಲೆ P1–P4 ಪಿನ್‌ಗಳನ್ನು ಕ್ಲಿಕ್ ಮಾಡಿ ಎಳೆಯಿರಿ.',
              language
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
