"use client";

import React, { useRef, useState, useMemo } from 'react';
import Map, { Marker, Source, Layer } from 'react-map-gl/maplibre';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { PlusCircleIcon, Search, GripVertical, FlagIcon, MapPinIcon, XIcon, Maximize2, Minimize2 } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const DEFAULT_CENTER = { lat: 34.0331, lng: -4.9998 }; // Fès, MA
const DEFAULT_ZOOM = 12;
const MAP_STYLE = 'https://api.maptiler.com/maps/019a213d-06f4-7ef2-be61-48b4b8fb7e56/style.json?key=cKuGgc1qdSgluaz2JWLK';

interface Coordinates {
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
}

interface POI {
  id?: string;
  fr?: string;
  en?: string;
  ar?: string;
  coordinates?: Coordinates;
  frLocalization?: { name?: string };
  enLocalization?: { name?: string };
  arLocalization?: { name?: string };
  files?: Array<{ fileUrl?: string }>;
  [key: string]: any;
}

interface NormalizedPOI {
  id: string;
  label: string;
  lat: number;
  lng: number;
  img?: string;
  raw: POI;
}

interface MapViewProps {
  latitude?: number;
  longitude?: number;
  zoom?: number;
  pois?: POI[];
  onSelectedPOIsChange?: (ids: string[]) => void;
  onSelectedPOIsDetailsChange?: (details: any[]) => void;
  defaultSelectedPoiIds?: string[];
}

export default function MapView({
  latitude = DEFAULT_CENTER.lat,
  longitude = DEFAULT_CENTER.lng,
  zoom = DEFAULT_ZOOM,
  pois = [],
  onSelectedPOIsChange,
  onSelectedPOIsDetailsChange,
  defaultSelectedPoiIds = []
}: MapViewProps) {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedPois, setSelectedPois] = useState<NormalizedPOI[]>([]);
  const [highlightedPoiId, setHighlightedPoiId] = useState<string | null>(null);
  const [routeGeoJSON, setRouteGeoJSON] = useState<any>(null);
  const [routeAnimatedGeoJSON, setRouteAnimatedGeoJSON] = useState<any>(null);
  const [isRouting, setIsRouting] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [connectorsGeoJSON, setConnectorsGeoJSON] = useState<any>(null);
  const [animateRoute, setAnimateRoute] = useState(false);
  const routeAnimFrameRef = useRef<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const enterFullscreen = () => {
    setIsFullscreen(true);
    const el = containerRef.current as any;
    if (el && el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    }
  };
  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
    setIsFullscreen(false);
  };
  React.useEffect(() => {
    const handler = () => {
      if (!document.fullscreenElement) setIsFullscreen(false);
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const startRouteAnimation = (coordsRaw: number[][]) => {
    const valid = (c: any) => Array.isArray(c) && Number.isFinite(c[0]) && Number.isFinite(c[1]);
    const coords = (coordsRaw || []).filter(valid);
    if (!coords || coords.length < 2) {
      setRouteAnimatedGeoJSON(null);
      return;
    }
    if (routeAnimFrameRef.current) cancelAnimationFrame(routeAnimFrameRef.current);
    const duration = 1000; // ms (peut être ajusté)
    const start = performance.now();
    const maxIndex = coords.length - 1;
    if (maxIndex === 0) {
      setRouteAnimatedGeoJSON({
        type: 'FeatureCollection',
        features: [{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coords } }],
      });
      return;
    }
    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const t = progress * maxIndex;
      const iBase = Math.floor(t);
      const i = Math.max(0, Math.min(maxIndex - 1, iBase));
      const f = Math.min(1, Math.max(0, t - i));
      let partial: number[][] = coords.slice(0, Math.max(1, i + 1));
      const a = coords[i];
      const b = coords[i + 1];
      if (Array.isArray(a) && Array.isArray(b)) {
        const interp: [number, number] = [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
        partial = [...partial, interp];
      }
      setRouteAnimatedGeoJSON({
        type: 'FeatureCollection',
        features: [{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: partial } }],
      });
      if (progress < 1) {
        routeAnimFrameRef.current = requestAnimationFrame(step);
      } else {
        routeAnimFrameRef.current = null;
      }
    };
    routeAnimFrameRef.current = requestAnimationFrame(step);
  };

  React.useEffect(() => {
    return () => {
      if (routeAnimFrameRef.current) cancelAnimationFrame(routeAnimFrameRef.current);
    };
  }, []);

  // Normalisation des POIs venant de l'API
  const normalizedPois = useMemo(() => {
    const toNumber = (v: any) => (v === null || v === undefined ? null : Number(v));
    return (pois || [])
      .map((raw) => {
        const lat = toNumber(raw?.coordinates?.lat ?? raw?.coordinates?.latitude);
        const lng = toNumber(raw?.coordinates?.lng ?? raw?.coordinates?.longitude);
        const filesArr: any[] = Array.isArray((raw as any)?.files) ? (raw as any).files : [];
        const imageFile = filesArr.find((f: any) => String(f?.type || '').toLowerCase() === 'image');
        const firstImage = (raw as any)?.initialImage || imageFile?.fileUrl;
        return {
          id: raw?.id ?? raw?.fr ?? raw?.en ?? raw?.ar ?? '',
          label: raw?.frLocalization?.name || raw?.enLocalization?.name || raw?.arLocalization?.name || raw?.fr || raw?.en || raw?.ar || 'POI',
          lat,
          lng,
          img: firstImage,
          raw,
        } as NormalizedPOI;
      })
      .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));
  }, [pois]);

  // Initialiser la sélection par défaut (édition) une seule fois
  const initSelectionRef = useRef(false);
  React.useEffect(() => {
    if (initSelectionRef.current) return;
    if (!defaultSelectedPoiIds || defaultSelectedPoiIds.length === 0) return;
    if (!normalizedPois || normalizedPois.length === 0) return;

    const ordered: NormalizedPOI[] = [];
    for (const id of defaultSelectedPoiIds) {
      const p = normalizedPois.find((np) => np.id === id);
      if (p) ordered.push(p);
    }
    if (ordered.length > 0) {
      setSelectedPois(ordered);
      initSelectionRef.current = true;
    }
  }, [normalizedPois, defaultSelectedPoiIds]);

  const focusPoi = (poi: NormalizedPOI) => {
    if (mapRef.current) {
      mapRef.current.flyTo({ 
        center: [poi.lng, poi.lat], 
        zoom: 15, 
        speed: 1.2, 
        curve: 1, 
        easing: (t: number) => t 
      });
    }
  };

  const addPoi = (poi: NormalizedPOI) => {
    setSelectedPois((prev) => {
      if (prev.find((p) => p.id === poi.id)) return prev;
      return [...prev, poi];
    });
  };

  const removePoi = (id: string) => {
    setSelectedPois((prev) => prev.filter((p) => p.id !== id));
  };

  // Distance de Haversine (mètres)
  const haversine = (a: NormalizedPOI, b: NormalizedPOI) => {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371000; // rayon terrestre (m)
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const sinDLat = Math.sin(dLat / 2);
    const sinDLon = Math.sin(dLon / 2);
    const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
    const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
    return R * c;
  };

  // Auto-tri (plus proche voisin) en conservant le 1er comme point de départ
  const autoSortSelectedPois = () => {
    if (selectedPois.length < 2) return;
    const start = selectedPois[0];
    const remaining = [...selectedPois.slice(1)];
    const ordered = [start];
    let current = start;
    while (remaining.length > 0) {
      let bestIndex = 0;
      let bestDist = Infinity;
      for (let i = 0; i < remaining.length; i++) {
        const d = haversine(current, remaining[i]);
        if (d < bestDist) {
          bestDist = d;
          bestIndex = i;
        }
      }
      const next = remaining.splice(bestIndex, 1)[0];
      ordered.push(next);
      current = next;
    }
    setSelectedPois(ordered);
  };

  // Trouve le point sur le segment AB le plus proche du point P
  const nearestPointOnSegment = (p: number[], a: number[], b: number[]) => {
    const ax = a[0], ay = a[1];
    const bx = b[0], by = b[1];
    const px = p[0], py = p[1];
    const abx = bx - ax, aby = by - ay;
    const apx = px - ax, apy = py - ay;
    const ab2 = abx * abx + aby * aby;
    const tRaw = ab2 === 0 ? 0 : (apx * abx + apy * aby) / ab2;
    const t = Math.max(0, Math.min(1, tRaw));
    return [ax + t * abx, ay + t * aby];
  };

  // Construit des segments (POI -> point le plus proche sur la route)
  const buildConnectors = (lineGeometry: any, pois: NormalizedPOI[]) => {
    if (!lineGeometry || !lineGeometry.coordinates || lineGeometry.coordinates.length < 2) return null;
    const coords = lineGeometry.coordinates;
    const features = [];
    for (const poi of pois) {
      const p = [poi.lng, poi.lat];
      let best = null;
      let bestDist2 = Infinity;
      for (let i = 0; i < coords.length - 1; i++) {
        const a = coords[i];
        const b = coords[i + 1];
        const q = nearestPointOnSegment(p, a, b);
        const dx = p[0] - q[0];
        const dy = p[1] - q[1];
        const d2 = dx * dx + dy * dy;
        if (d2 < bestDist2) {
          bestDist2 = d2;
          best = q;
        }
      }
      if (best) {
        features.push({
          type: 'Feature',
          properties: { label: poi.label },
          geometry: { type: 'LineString', coordinates: [p, best] },
        });
      }
    }
    return { type: 'FeatureCollection', features };
  };

  // Calcule un itinéraire PIÉTON en suivant l'ordre des POIs sélectionnés
  const computeRoute = async () => {
    if (selectedPois.length < 2) return;
    try {
      setIsRouting(true);
      setRouteError(null);
      setRouteGeoJSON(null);
      setRouteAnimatedGeoJSON(null);
      setAnimateRoute(false);

      // Construire la chaîne de coordonnées lon,lat;lon,lat...
      const coords = selectedPois.map((p) => `${p.lng},${p.lat}`).join(';');

      // OSRM profil piéton (serveur public FOSSGIS)
      const url = `https://routing.openstreetmap.de/routed-foot/route/v1/foot/${coords}?overview=full&geometries=geojson&steps=false&annotations=false&alternatives=false`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`OSRM error ${res.status}`);
      const data = await res.json();
      if (data.code !== 'Ok' || !data.routes || !data.routes[0]) throw new Error('Itinéraire introuvable');

      const line = data.routes[0].geometry; // GeoJSON LineString
      const fc = { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: line }] };
      setRouteGeoJSON(fc);
      setConnectorsGeoJSON(buildConnectors(line, selectedPois));

      // Trigger animation of the route line (~0.5s)
      try {
        startRouteAnimation(line.coordinates as number[][]);
      } catch {}

      // Fit bounds sur l'itinéraire
      const coordsArr = line.coordinates;
      let minLon = Infinity, minLat = Infinity, maxLon = -Infinity, maxLat = -Infinity;
      for (const [lon, lat] of coordsArr) {
        if (lon < minLon) minLon = lon;
        if (lat < minLat) minLat = lat;
        if (lon > maxLon) maxLon = lon;
        if (lat > maxLat) maxLat = lat;
      }
      if (mapRef.current && Number.isFinite(minLon)) {
        mapRef.current.fitBounds([[minLon, minLat], [maxLon, maxLat]], { padding: 60, duration: 800 });
      }
    } catch (e: any) {
      setRouteError(e.message || 'Erreur de calcul de route');
    } finally {
      setIsRouting(false);
    }
  };

  // Recalculer les connecteurs si la sélection change après un calcul d'itinéraire
  React.useEffect(() => {
    if (routeGeoJSON && routeGeoJSON.features && routeGeoJSON.features[0]) {
      const line = routeGeoJSON.features[0].geometry;
      const connectors = buildConnectors(line, selectedPois);
      setConnectorsGeoJSON(connectors);
    } else {
      setConnectorsGeoJSON(null);
    }
  }, [selectedPois, routeGeoJSON]);

  // Propager la sélection au parent (ids et détails ordonnés)
  React.useEffect(() => {
    try {
      if (typeof onSelectedPOIsChange === 'function') {
        onSelectedPOIsChange(selectedPois.map((p) => p.id));
      }
      if (typeof onSelectedPOIsDetailsChange === 'function') {
        onSelectedPOIsDetailsChange(selectedPois.map((p, index) => ({
          id: p.id,
          label: p.label,
          lat: p.lat,
          lng: p.lng,
          img: p.img,
          order: index + 1,
          raw: p.raw,
        })));
      }
    } catch (_) {
      // no-op
    }
  }, [selectedPois]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSelectedPois((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex w-full h-[600px] rounded-lg overflow-hidden shadow-xl border border-border bg-background",
        isFullscreen && "fixed inset-0 z-[1000] w-screen h-screen rounded-none"
      )}
    >
      <div className="w-[400px] h-full overflow-y-auto border-r border-border bg-card">
        <SelectedPoiList
          pois={selectedPois}
          focusPoi={focusPoi}
          removePoi={removePoi}
          computeRoute={computeRoute}
          isRouting={isRouting}
          routeError={routeError}
          autoSort={autoSortSelectedPois}
          onDragEnd={handleDragEnd}
        />
        <PoiList
          pois={normalizedPois}
          focusPoi={focusPoi}
          addPoi={addPoi}
          selectedIds={selectedPois.map(p => p.id)}
          highlightedId={highlightedPoiId}
        />
      </div>
      <div className="flex-1 h-full relative">
        <div className="absolute top-3 right-3 z-[1010] flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={isFullscreen ? exitFullscreen : enterFullscreen}
            className="h-9 w-9 bg-background/70 backdrop-blur-sm hover:bg-background"
            title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
        <Map
          ref={mapRef}
          initialViewState={{ latitude, longitude, zoom }}
          mapStyle={MAP_STYLE}
          mapLib={maplibregl}
          style={{ width: '100%', height: '100%' }}
        >
          {routeGeoJSON && (
            <>
              {/* Bordure (en dessous) */}
              <Source id="route-border" type="geojson" data={routeAnimatedGeoJSON || routeGeoJSON}>
                <Layer
                  id="route-border-line"
                  type="line"
                  paint={{
                    'line-color': '#000000',
                    'line-width': 8,
                    'line-opacity': 0.8
                  }}
                />
              </Source>

              {/* Ligne principale (au-dessus) avec animation */}
              <Source id="route" type="geojson" data={routeAnimatedGeoJSON || routeGeoJSON}>
                <Layer
                  id="route-line"
                  type="line"
                  paint={{
                    'line-color': '#3593eb',
                    'line-width': 4,
                    'line-opacity': 0.9
                  }}
                  layout={{
                    'line-cap': 'round',
                    'line-join': 'round'
                  }}
                />
              </Source>

              {/* Liaisons POI -> route (pointillés) */}
              {connectorsGeoJSON && connectorsGeoJSON.features.length > 0 && (
                <Source id="poi-connectors" type="geojson" data={connectorsGeoJSON}>
                  <Layer
                    id="poi-connector"
                    type="line"
                    paint={{ 
                      'line-color': '#3593eb',
                      'line-width': 2,
                      'line-opacity': 0.6,
                      'line-dasharray': [2, 2]
                    }}
                  />
                </Source>
              )}
            </>
          )}
          {/* Markers pour POIs non sélectionnés */}
          {normalizedPois
            .filter(poi => !selectedPois.find(sp => sp.id === poi.id))
            .map((poi) => (
              <Marker key={poi.id} longitude={poi.lng} latitude={poi.lat} anchor="bottom">
                <div
                  onClick={() => { setHighlightedPoiId(poi.id); focusPoi(poi); }}
                  className="w-12 h-12 border-2 border-foreground bg-muted rounded-full overflow-hidden shadow-lg hover:scale-110 transition-transform cursor-pointer"
                >
                  <img 
                    src={poi?.img || 'https://placehold.co/100x100?text=POI'} 
                    alt={poi.label} 
                    className="w-full h-full object-cover" 
                  />
                </div>
              </Marker>
            ))}
          {/* Markers pour POIs sélectionnés avec icônes distinctes */}
          {selectedPois.map((poi, index) => {
            const isStart = index === 0;
            const isEnd = index === selectedPois.length - 1;
            
            return (
              <Marker key={poi.id} longitude={poi.lng} latitude={poi.lat} anchor="bottom">
                <div className="relative cursor-pointer" onClick={() => { setHighlightedPoiId(poi.id); focusPoi(poi); }}>
                  <div className="w-14 h-14 border-3 border-primary bg-accent rounded-full overflow-hidden shadow-xl hover:scale-110 transition-transform">
                    <img 
                      src={poi?.img || 'https://placehold.co/100x100?text=POI'} 
                      alt={poi.label} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  {isStart && (
                    <div className="absolute -top-1 -right-1 bg-white text-green-600 rounded-full p-1.5 shadow-lg">
                      <MapPinIcon className="w-4 h-4" />
                    </div>
                  )}
                  {isEnd && selectedPois.length > 1 && (
                    <div className="absolute -top-1 -right-1 bg-white text-red-600 rounded-full p-1.5 shadow-lg">
                      <FlagIcon className="w-4 h-4" />
                    </div>
                  )}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md">
                    {index + 1}
                  </div>
                </div>
              </Marker>
            );
          })}
        </Map>
      </div>
    </div>
  );
}

interface SortableItemProps {
  poi: NormalizedPOI;
  index: number;
  total: number;
  focusPoi: (poi: NormalizedPOI) => void;
  removePoi: (id: string) => void;
}

function SortableItem({ poi, index, total, focusPoi, removePoi }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: poi.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isStart = index === 0;
  const isEnd = index === total - 1;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-3 border-b border-border bg-card hover:bg-muted/50 transition-colors cursor-pointer group",
        isDragging && "shadow-lg z-50"
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
      >
        <GripVertical className="w-5 h-5" />
      </div>
      
      <div onClick={() => focusPoi(poi)} className="flex items-center gap-3 flex-1 min-w-0">
        <div className="relative flex-shrink-0">
          <img 
            src={poi.img || 'https://placehold.co/100x100?text=POI'} 
            alt={poi.label} 
            className="w-12 h-12 rounded-lg object-cover border-2 border-primary"
          />
          <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
            {index + 1}
          </div>
        </div>
        
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm truncate">{poi.label}</span>
            {isStart && (
              <MapPinIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
            )}
            {isEnd && total > 1 && (
              <FlagIcon className="w-4 h-4 text-red-600 flex-shrink-0" />
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {poi.lat.toFixed(4)}, {poi.lng.toFixed(4)}
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          removePoi(poi.id);
        }}
        className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
      >
        <XIcon className="w-4 h-4" />
      </Button>
    </div>
  );
}

interface SelectedPoiListProps {
  pois: NormalizedPOI[];
  focusPoi: (poi: NormalizedPOI) => void;
  removePoi: (id: string) => void;
  computeRoute: () => void;
  isRouting: boolean;
  routeError: string | null;
  autoSort: () => void;
  onDragEnd: (event: DragEndEvent) => void;
}

const SelectedPoiList = ({
  pois,
  focusPoi,
  removePoi,
  computeRoute,
  isRouting,
  routeError,
  autoSort,
  onDragEnd,
}: SelectedPoiListProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div>
      <div className="p-4 border-b border-border sticky top-0 bg-card z-10 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">Sélection ({pois.length})</h3>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={autoSort}
              disabled={pois.length < 2}
              className="text-xs"
            >
              Auto-tri
            </Button>
            <Button
              type="button"
              onClick={computeRoute}
              disabled={pois.length < 2 || isRouting}
              size="sm"
              className="text-xs"
            >
              {isRouting ? 'Calcul...' : 'Tracer'}
            </Button>
          </div>
        </div>
        {routeError && (
          <div className="text-xs text-destructive bg-destructive/10 p-2 rounded-md">
            {routeError}
          </div>
        )}
      </div>
      
      <div>
        {pois.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            Aucun POI sélectionné.
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={pois.map(p => p.id)}
              strategy={verticalListSortingStrategy}
            >
              {pois.map((poi, index) => (
                <SortableItem
                  key={poi.id}
                  poi={poi}
                  index={index}
                  total={pois.length}
                  focusPoi={focusPoi}
                  removePoi={removePoi}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
};

interface PoiListProps {
  pois: NormalizedPOI[];
  focusPoi: (poi: NormalizedPOI) => void;
  addPoi: (poi: NormalizedPOI) => void;
  selectedIds: string[];
  highlightedId?: string | null;
}

const PoiList = ({ pois, focusPoi, addPoi, selectedIds, highlightedId }: PoiListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  React.useEffect(() => {
    if (!highlightedId) return;
    const el = rowRefs.current[highlightedId];
    if (el && el.scrollIntoView) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightedId]);

  const filteredPois = useMemo(() => {
    if (!searchQuery.trim()) return pois;
    const query = searchQuery.toLowerCase();
    return pois.filter(poi => 
      poi.label.toLowerCase().includes(query)
    );
  }, [pois, searchQuery]);

  return (
    <div>
      <div className="p-4 border-b border-border sticky top-0 bg-card z-10 space-y-3">
        <h3 className="font-bold text-lg">Points d'intérêt</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher un POI..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>
      <div>
        {filteredPois.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            {searchQuery ? 'Aucun résultat trouvé.' : 'Aucun POI disponible.'}
          </div>
        ) : (
          filteredPois.map((poi) => {
            const isSelected = selectedIds.includes(poi.id);
            const isHighlighted = highlightedId === poi.id;
            return (
            <div
              key={poi.id}
              ref={(el) => { rowRefs.current[poi.id] = el; }}
              onClick={() => focusPoi(poi)}
              className={cn(
                "flex items-center gap-3 p-3 border-b border-border transition-colors cursor-pointer group",
                isHighlighted ? "bg-blue-50" : "hover:bg-muted/50"
              )}
            >
              <img 
                src={poi.img || 'https://placehold.co/100x100?text=POI'} 
                alt={poi.label} 
                className="w-12 h-12 rounded-lg object-cover border border-border"
              />
              <div className="flex flex-col flex-1 min-w-0">
                <span className="font-semibold text-sm truncate">{poi.label}</span>
                <span className="text-xs text-muted-foreground">
                  {poi.lat.toFixed(4)}, {poi.lng.toFixed(4)}
                </span>
              </div>
              {isSelected ? (
                <span className="ml-2 px-2 py-1 text-[11px] rounded-full bg-green-100 text-green-700">
                  Sélectionné
                </span>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    addPoi(poi);
                  }}
                  className="flex-shrink-0 h-8 w-8 hover:bg-blue-50"
                >
                  <PlusCircleIcon className="w-5 h-5 text-blue-600" />
                </Button>
              )}
            </div>
          );})
        )}
      </div>
    </div>
  );
};
