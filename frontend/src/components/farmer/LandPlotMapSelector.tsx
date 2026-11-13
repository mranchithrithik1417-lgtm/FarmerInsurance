import React, { useState, useRef, useEffect, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  RotateCcw,
  Undo2,
  CheckCircle2,
  Crosshair,
  Layers,
  Sparkles,
  Info,
  LocateFixed,
  MapPin,
  Wand2
} from 'lucide-react';
import { encodeDigipin } from '../../utils/digipin';
import {
  calculatePolygonAreaAcres,
  calculatePolygonCentroid,
  calculateEdgeDistances,
  generateDefaultParcelCoordinates,
  haversineDistanceMeters
} from '../../utils/geo';
import { b } from '../../utils/translations';
import { playChime } from '../../utils/speech';

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
  const polylineLayerRef = useRef<L.Polyline | null>(null);
  const digipinSquareRef = useRef<L.Rectangle | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const edgeDistanceMarkersRef = useRef<L.Marker[]>([]);
  const centroidMarkerRef = useRef<L.Marker | null>(null);

  // Active satellite tile provider
  const [satelliteProvider, setSatelliteProvider] = useState<'esri' | 'google'>('esri');
  const [isMapReady, setIsMapReady] = useState<boolean>(false);

  // Selected Points state: starts clean with 0 points unless initialCoords has 4 points
  const [points, setPoints] = useState<[number, number][]>(() => {
    if (initialCoords && initialCoords.length === 4) {
      return initialCoords;
    }
    return [];
  });

  const pointsRef = useRef<[number, number][]>(points);
  pointsRef.current = points;
  const isDraggingRef = useRef<boolean>(false);

  // Live HUD metrics
  const [liveAreaAcres, setLiveAreaAcres] = useState<number>(() =>
    points.length >= 3 ? calculatePolygonAreaAcres(points) : 0
  );
  const [liveCentroid, setLiveCentroid] = useState<[number, number]>(() =>
    points.length >= 3 ? calculatePolygonCentroid(points) : [initialCenterLat, initialCenterLon]
  );
  const [liveDigipin, setLiveDigipin] = useState<string>(() => {
    if (points.length >= 3) {
      const c = calculatePolygonCentroid(points);
      return encodeDigipin(c[0], c[1]);
    }
    return encodeDigipin(initialCenterLat, initialCenterLon);
  });
  const [livePerimeterMeters, setLivePerimeterMeters] = useState<number>(() => {
    if (points.length >= 2) {
      const dists = calculateEdgeDistances(points);
      return dists.reduce((a, b) => a + b, 0);
    }
    return 0;
  });

  // Create custom Leaflet DIV Icon for corner pins
  const createPinIcon = (index: number, isActive: boolean = false) => {
    const isComplete = pointsRef.current.length === 4;
    return L.divIcon({
      className: 'leaflet-custom-marker',
      html: `
        <div style="
          width: 32px;
          height: 32px;
          background: ${isActive ? '#38bdf8' : isComplete ? '#10b981' : '#06b6d4'};
          color: #020617;
          border: 2.5px solid #ffffff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 11px;
          font-family: ui-monospace, monospace;
          box-shadow: 0 4px 14px rgba(0,0,0,0.7), 0 0 ${isActive ? '15px #38bdf8' : '10px rgba(16,185,129,0.8)'};
          cursor: ${isComplete ? 'grab' : 'crosshair'};
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
    const isClosed = currentPts.length === 4;
    const n = isClosed ? 4 : currentPts.length - 1;

    if (n <= 0) {
      edgeDistanceMarkersRef.current.forEach(m => m.remove());
      edgeDistanceMarkersRef.current = [];
      return;
    }

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
      const nextIdx = (i + 1) % currentPts.length;
      const p1 = currentPts[i];
      const p2 = currentPts[nextIdx];
      const midLat = (p1[0] + p2[0]) / 2;
      const midLon = (p1[1] + p2[1]) / 2;
      const dist = Math.round(haversineDistanceMeters(p1[0], p1[1], p2[0], p2[1]));

      const marker = edgeDistanceMarkersRef.current[i];
      if (marker) {
        marker.setLatLng([midLat, midLon]);
        marker.setIcon(createDistanceIcon(dist));
      }
    }
  }, []);

  // Update DIGIPIN 4x4m square and centroid reticle
  const updateCentroidAndDigipin = useCallback((currentPts: [number, number][], map: L.Map) => {
    if (currentPts.length < 4) {
      if (digipinSquareRef.current) {
        digipinSquareRef.current.remove();
        digipinSquareRef.current = null;
      }
      if (centroidMarkerRef.current) {
        centroidMarkerRef.current.remove();
        centroidMarkerRef.current = null;
      }
      return;
    }

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

    // Map Click Handler: Place 4 points manually on satellite map
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (isDraggingRef.current) return;

      const current = pointsRef.current;
      if (current.length >= 4) {
        // Already has 4 points; user can click reset to re-pick
        return;
      }

      const lat = Number(e.latlng.lat.toFixed(6));
      const lng = Number(e.latlng.lng.toFixed(6));
      const nextPoints: [number, number][] = [...current, [lat, lng]];

      setPoints(nextPoints);
      pointsRef.current = nextPoints;

      if (nextPoints.length === 4) {
        playChime('success');
      } else {
        playChime('start');
      }
    });

    const resizeTimer1 = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    const resizeTimer2 = setTimeout(() => {
      map.invalidateSize();
    }, 450);

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

    if (dist > 30) {
      mapInstanceRef.current.flyTo([initialCenterLat, initialCenterLon], 18, {
        duration: 1.0
      });
    }
  }, [initialCenterLat, initialCenterLon]);

  // Synchronize Points onto Map (Polyline when 1-3 points, Polygon when 4 points)
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady) return;
    const map = mapInstanceRef.current;

    // 1. If 4 points: Draw Closed Polygon
    if (points.length === 4) {
      if (polylineLayerRef.current) {
        polylineLayerRef.current.remove();
        polylineLayerRef.current = null;
      }

      if (!polygonLayerRef.current) {
        polygonLayerRef.current = L.polygon(points, {
          color: '#10b981',
          weight: 2.5,
          fillColor: '#10b981',
          fillOpacity: 0.26,
          dashArray: '6, 4'
        }).addTo(map);
      } else {
        polygonLayerRef.current.setLatLngs(points);
      }

      // Calculate Metrics
      const a = calculatePolygonAreaAcres(points);
      const c = calculatePolygonCentroid(points);
      const d = encodeDigipin(c[0], c[1]);
      const ed = calculateEdgeDistances(points);
      const p = ed.reduce((acc, curr) => acc + curr, 0);

      setLiveAreaAcres(a);
      setLiveCentroid(c);
      setLiveDigipin(d);
      setLivePerimeterMeters(p);

      // Trigger Parent callback
      if (onPlotChange) {
        onPlotChange({
          coords: points,
          areaAcres: a,
          centroidLat: c[0],
          centroidLon: c[1],
          digipin: d
        });
      }
    } else {
      // Less than 4 points: Remove polygon, draw open polyline
      if (polygonLayerRef.current) {
        polygonLayerRef.current.remove();
        polygonLayerRef.current = null;
      }

      if (points.length >= 2) {
        if (!polylineLayerRef.current) {
          polylineLayerRef.current = L.polyline(points, {
            color: '#06b6d4',
            weight: 3,
            dashArray: '5, 5'
          }).addTo(map);
        } else {
          polylineLayerRef.current.setLatLngs(points);
        }
      } else {
        if (polylineLayerRef.current) {
          polylineLayerRef.current.remove();
          polylineLayerRef.current = null;
        }
      }
    }

    // 2. Corner Point Markers (P1..Pn)
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    points.forEach((pt, idx) => {
      const isComplete = points.length === 4;
      const marker = L.marker(pt, {
        draggable: isComplete, // Only draggable once all 4 points placed
        icon: createPinIcon(idx, false),
        autoPan: true
      }).addTo(map);

      if (isComplete) {
        marker.on('dragstart', () => {
          isDraggingRef.current = true;
          marker.setIcon(createPinIcon(idx, true));
        });

        marker.on('drag', () => {
          const newLatLng = marker.getLatLng();
          const lat = Number(newLatLng.lat.toFixed(6));
          const lng = Number(newLatLng.lng.toFixed(6));

          pointsRef.current[idx] = [lat, lng];

          if (polygonLayerRef.current) {
            polygonLayerRef.current.setLatLngs(pointsRef.current);
          }

          updateEdgeBadges(pointsRef.current, map);
          updateCentroidAndDigipin(pointsRef.current, map);

          const a = calculatePolygonAreaAcres(pointsRef.current);
          const c = calculatePolygonCentroid(pointsRef.current);
          const d = encodeDigipin(c[0], c[1]);
          const ed = calculateEdgeDistances(pointsRef.current);
          const p = ed.reduce((acc, curr) => acc + curr, 0);

          setLiveAreaAcres(a);
          setLiveCentroid(c);
          setLiveDigipin(d);
          setLivePerimeterMeters(p);
        });

        marker.on('dragend', () => {
          isDraggingRef.current = false;
          marker.setIcon(createPinIcon(idx, false));
          const finalPts: [number, number][] = [...pointsRef.current];
          setPoints(finalPts);

          if (onPlotChange) {
            const a = calculatePolygonAreaAcres(finalPts);
            const c = calculatePolygonCentroid(finalPts);
            const d = encodeDigipin(c[0], c[1]);
            onPlotChange({
              coords: finalPts,
              areaAcres: a,
              centroidLat: c[0],
              centroidLon: c[1],
              digipin: d
            });
          }
        });
      }

      markersRef.current.push(marker);
    });

    // 3. Update Badges & Centroid
    updateEdgeBadges(points, map);
    updateCentroidAndDigipin(points, map);
  }, [points, isMapReady, updateEdgeBadges, updateCentroidAndDigipin, onPlotChange]);

  // Handler: Reset / Clear Points to start fresh
  const handleReset = () => {
    setPoints([]);
    pointsRef.current = [];
    if (polygonLayerRef.current) {
      polygonLayerRef.current.remove();
      polygonLayerRef.current = null;
    }
    if (polylineLayerRef.current) {
      polylineLayerRef.current.remove();
      polylineLayerRef.current = null;
    }
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    edgeDistanceMarkersRef.current.forEach(m => m.remove());
    edgeDistanceMarkersRef.current = [];
    if (digipinSquareRef.current) {
      digipinSquareRef.current.remove();
      digipinSquareRef.current = null;
    }
    if (centroidMarkerRef.current) {
      centroidMarkerRef.current.remove();
      centroidMarkerRef.current = null;
    }
    setLiveAreaAcres(0);
    setLivePerimeterMeters(0);
  };

  // Handler: Undo Last Point
  const handleUndo = () => {
    if (points.length === 0) return;
    const next = points.slice(0, -1);
    setPoints(next);
    pointsRef.current = next;
  };

  // Handler: Auto-fill 4 default corners (convenience preset)
  const handleAutoFillDefault = () => {
    const defaultPts = generateDefaultParcelCoordinates(initialCenterLat, initialCenterLon);
    setPoints(defaultPts);
    pointsRef.current = defaultPts;
    playChime('success');
  };

  // Handler: Recenter View
  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    const target = points.length === 4 ? liveCentroid : [initialCenterLat, initialCenterLon];
    mapInstanceRef.current.flyTo([target[0], target[1]], 18, {
      duration: 0.8
    });
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
      {/* Top Header & Map Controls */}
      <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
            <Crosshair className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                {b('4-Point Land Boundary Selector', '4-ಬಿಂದುಗಳ ಜಮೀನಿನ ಗಡಿ ಆಯ್ಕೆಗಾರ', language)}
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-800 font-mono px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
                {points.length === 4
                  ? b('BOUNDARY FORMED', 'ಗಡಿ ರಚನೆಯಾಗಿದೆ', language)
                  : b(`POINT ${points.length} OF 4`, `ಬಿಂದು ${points.length} / 4`, language)}
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              {b(
                'Click 4 corners of your land parcel on the satellite map to form boundary and generate DIGIPIN.',
                'ಗಡಿ ರಚಿಸಲು ಮತ್ತು ಡಿಜಿಪಿನ್ ಪಡೆಯಲು ಉಪಗ್ರಹ ನಕ್ಷೆಯಲ್ಲಿ ನಿಮ್ಮ ಜಮೀನಿನ 4 ಮೂಲೆಗಳನ್ನು ಕ್ಲಿಕ್ ಮಾಡಿ.',
                language
              )}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          {points.length > 0 && points.length < 4 && (
            <button
              type="button"
              onClick={handleUndo}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-semibold rounded-lg flex items-center gap-1 border border-slate-200 transition cursor-pointer shadow-sm"
              title="Undo last placed corner point"
            >
              <Undo2 className="w-3.5 h-3.5 text-slate-600" />
              <span>{b('Undo', 'ಹಿಂದಕ್ಕೆ', language)}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleReset}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-semibold rounded-lg flex items-center gap-1 border border-slate-200 transition cursor-pointer shadow-sm"
            title="Reset and re-select 4 points"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
            <span>{b('Reset / Pick 4 Points', 'ಮರುಹೊಂದಿಸಿ / 4 ಬಿಂದು ಆಯ್ಕೆ', language)}</span>
          </button>

          {points.length === 0 && (
            <button
              type="button"
              onClick={handleAutoFillDefault}
              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-lg flex items-center gap-1 border border-emerald-200 transition cursor-pointer shadow-sm"
              title="Auto-fill sample 4 corners around survey center"
            >
              <Wand2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>{b('Sample 4 Corners', 'ಮಾದರಿ 4 ಮೂಲೆಗಳು', language)}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleRecenter}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-semibold rounded-lg flex items-center gap-1 border border-slate-200 transition cursor-pointer shadow-sm"
            title="Recenter view on plot"
          >
            <LocateFixed className="w-3.5 h-3.5 text-emerald-700" />
            <span>{b('Recenter', 'ಮಧ್ಯಕ್ಕೆ ತನ್ನಿ', language)}</span>
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

      {/* 4-Step Selection Progress Banner */}
      <div className="px-3.5 py-2.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-b border-emerald-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {/* Step Pill Indicators */}
          <div className="flex items-center gap-1 font-mono">
            {[0, 1, 2, 3].map((stepIdx) => {
              const isFilled = points.length > stepIdx;
              const isCurrent = points.length === stepIdx;
              return (
                <div
                  key={stepIdx}
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] transition-all ${
                    isFilled
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : isCurrent
                      ? 'bg-white border-2 border-emerald-600 text-emerald-700 animate-pulse'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isFilled ? '✓' : `P${stepIdx + 1}`}
                </div>
              );
            })}
          </div>

          <span className="font-bold text-slate-800 text-xs">
            {points.length === 0 &&
              b('👉 Click Corner 1 on the satellite map', '👉 ಉಪಗ್ರಹ ನಕ್ಷೆಯಲ್ಲಿ 1ನೇ ಮೂಲೆಯನ್ನು ಕ್ಲಿಕ್ ಮಾಡಿ', language)}
            {points.length === 1 &&
              b('👉 Click Corner 2 on the satellite map', '👉 ಉಪಗ್ರಹ ನಕ್ಷೆಯಲ್ಲಿ 2ನೇ ಮೂಲೆಯನ್ನು ಕ್ಲಿಕ್ ಮಾಡಿ', language)}
            {points.length === 2 &&
              b('👉 Click Corner 3 on the satellite map', '👉 ಉಪಗ್ರಹ ನಕ್ಷೆಯಲ್ಲಿ 3ನೇ ಮೂಲೆಯನ್ನು ಕ್ಲಿಕ್ ಮಾಡಿ', language)}
            {points.length === 3 &&
              b('👉 Click Corner 4 to complete boundary & lock DIGIPIN', '👉 ಗಡಿ ಪೂರ್ಣಗೊಳಿಸಲು ಮತ್ತು ಡಿಜಿಪಿನ್ ಲಾಕ್ ಮಾಡಲು 4ನೇ ಮೂಲೆಯನ್ನು ಕ್ಲಿಕ್ ಮಾಡಿ', language)}
            {points.length === 4 && (
              <span className="text-emerald-800 font-extrabold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {b('✓ 4 Points Selected — Cadastral Boundary Formed!', '✓ 4 ಬಿಂದುಗಳು ಆಯ್ಕೆಯಾಗಿವೆ — ಕಂದಾಯ ಗಡಿ ರಚನೆಯಾಗಿದೆ!', language)}
              </span>
            )}
          </span>
        </div>

        {points.length === 4 && (
          <div className="font-mono text-emerald-900 bg-emerald-100/90 border border-emerald-300 px-2.5 py-0.5 rounded-lg text-[11px] font-bold">
            DIGIPIN: {liveDigipin}
          </div>
        )}
      </div>

      {/* Real Dynamic Satellite Map Canvas */}
      <div className="relative w-full h-[380px] sm:h-[430px] select-none bg-slate-950 overflow-hidden">
        <div ref={mapContainerRef} className="w-full h-full z-0 cursor-crosshair" />

        {/* Top-Left Cadastral HUD Overlay */}
        <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-md border border-slate-200 px-3 py-1.5 rounded-xl z-10 text-[10px] space-y-0.5 shadow-md pointer-events-none">
          <div className="flex items-center gap-1.5 font-bold text-slate-900">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{b('Cadastral Survey #', 'ಕಂದಾಯ ಸರ್ವೆ ಸಂಖ್ಯೆ #', language)}{surveyNumber}</span>
            {points.length === 4 && (
              <span className="text-emerald-700 font-mono font-bold">({liveAreaAcres} {b('ac', 'ಎಕರೆ', language)})</span>
            )}
          </div>
          <div className="text-slate-600 font-mono text-[9px]">
            {points.length === 4
              ? `GPS: ${liveCentroid[0].toFixed(5)}°N, ${liveCentroid[1].toFixed(5)}°E`
              : b('Tap 4 corners of land on satellite image', 'ಉಪಗ್ರಹ ಚಿತ್ರದ ಮೇಲೆ ಜಮೀನಿನ 4 ಮೂಲೆಗಳನ್ನು ಟ್ಯಾಪ್ ಮಾಡಿ', language)}
          </div>
        </div>

        {/* Bottom Real-Time Telemetry Bar */}
        {points.length === 4 ? (
          <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-md border border-slate-200 px-3 py-2 rounded-xl z-10 flex flex-wrap items-center justify-between gap-2 text-xs shadow-lg animate-fadeIn">
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
                  {livePerimeterMeters}m (4 {b('corners', 'ಮೂಲೆಗಳು', language)})
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
              <span>{b('DIGIPIN & Boundary Linked', 'ಡಿಜಿಪಿನ್ ಮತ್ತು ಗಡಿ ಲಿಂಕ್ ಆಗಿದೆ', language)}</span>
            </div>
          </div>
        ) : (
          <div className="absolute bottom-2 left-2 right-2 bg-slate-900/85 backdrop-blur-md border border-slate-700 px-3 py-2 rounded-xl z-10 text-white text-xs flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="text-slate-200">
                {b(
                  `Click on the map to place corner ${points.length + 1} of 4. When 4 points are placed, boundary & DIGIPIN will form automatically.`,
                  `4 ಮೂಲೆಗಳಲ್ಲಿ ${points.length + 1} ನೇ ಮೂಲೆಯನ್ನು ನಕ್ಷೆಯಲ್ಲಿ ಕ್ಲಿಕ್ ಮಾಡಿ. 4 ಬಿಂದುಗಳು ಪೂರ್ಣಗೊಂಡಾಗ ಗಡಿ ಮತ್ತು ಡಿಜಿಪಿನ್ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ರಚನೆಯಾಗುತ್ತದೆ.`,
                  language
                )}
              </span>
            </div>
            <span className="font-mono text-emerald-300 font-bold text-xs">
              {points.length} / 4
            </span>
          </div>
        )}
      </div>

      {/* Guidance Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <Info className="w-4 h-4 text-emerald-700 flex-shrink-0" />
          <span>
            {b(
              'No need to drag! Simply click the 4 corners of your land parcel directly on the satellite view. Once 4 points are clicked, your boundary and DIGIPIN are locked.',
              'ಎಳೆಯುವ ಅಗತ್ಯವಿಲ್ಲ! ಉಪಗ್ರಹ ನಕ್ಷೆಯಲ್ಲಿ ನಿಮ್ಮ ಜಮೀನಿನ 4 ಮೂಲೆಗಳನ್ನು ನೇರವಾಗಿ ಕ್ಲಿಕ್ ಮಾಡಿ. 4 ಬಿಂದುಗಳನ್ನು ಕ್ಲಿಕ್ ಮಾಡಿದ ತಕ್ಷಣ ಗಡಿ ಮತ್ತು ಡಿಜಿಪಿನ್ ಲಾಕ್ ಆಗುತ್ತದೆ.',
              language
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
