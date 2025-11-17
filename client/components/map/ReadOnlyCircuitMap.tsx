"use client";

import React from 'react';
import Map, { Marker, Source, Layer } from 'react-map-gl/maplibre';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPinIcon, FlagIcon, Maximize2, Minimize2, Star, Map as MapIcon, Clock as ClockIcon, Navigation, Share, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
// import { useStartCircuitMutation } from '@/services/api/CircuitProgressApi';
import { useRouter } from '@/i18n/navigation';
import { toast } from 'sonner';
import { useGetPOIByIdQuery, useGetFilteredPOIsQuery } from '@/services/api/PoiApi';
import { skipToken } from '@reduxjs/toolkit/query';
import { SERVER_GATEWAY_DOMAIN } from '@/services/BaseQuery';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import Login from '@/components/auth/Login';
import SignUp from '@/components/auth/SignUp';
import { useGPSTracker } from '@/hooks/useGPSTracker';
import { 
  useStartRouteMutation, 
  useGetRouteByIdQuery, 
  useAddVisitedTraceMutation,
  useRemovePOIFromRouteMutation 
} from '@/services/api/RouteApi';

const DEFAULT_CENTER = { lat: 34.0331, lng: -4.9998 }; // Fès, MA
const DEFAULT_ZOOM = 12;
const MAP_STYLE = 'https://api.maptiler.com/maps/019a213d-06f4-7ef2-be61-48b4b8fb7e56/style.json?key=cKuGgc1qdSgluaz2JWLK';

interface RawPOI {
  id?: string;
  fr?: string;
  en?: string;
  ar?: string;
  coordinates?: string | { lat?: number; lng?: number; latitude?: number; longitude?: number };
  frLocalization?: { name?: string; description?: string } | null;
  enLocalization?: { name?: string; description?: string } | null;
  arLocalization?: { name?: string; description?: string } | null;
  files?: Array<{ fileUrl?: string }>; 
  CircuitPOI?: { order?: number | null } | null;
  [key: string]: any;
}

interface NormalizedPOI {
  id: string;
  label: string;
  lat: number;
  lng: number;
  img?: string;
  order: number;
  raw: RawPOI;
}

interface ReadOnlyCircuitMapProps {
  pois: RawPOI[];
  locale: string;
  circuit?: any; // circuit brut renvoyé par l'API (pour l'en-tête du sidebar)
}

export default function ReadOnlyCircuitMap({ pois = [], locale, circuit }: ReadOnlyCircuitMapProps) {
  const mapRef = React.useRef<any>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const hasInitiallyPositioned = React.useRef(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [routeGeoJSON, setRouteGeoJSON] = React.useState<any>(null);
  const [routeAnimatedGeoJSON, setRouteAnimatedGeoJSON] = React.useState<any>(null);
  const routeAnimFrameRef = React.useRef<number | null>(null);
  // const [startCircuit, { isLoading: isStarting }] = useStartCircuitMutation();
  const [isStarting, setIsStarting] = React.useState(false);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedPoiId, setSelectedPoiId] = React.useState<string | null>(null);
  const { data: fetchedPoiData, isFetching: isFetchingPoi } = useGetPOIByIdQuery(selectedPoiId ?? skipToken as any);
  // Charger tous les POIs si non fournis via props
  const { data: fetchedAllPoisResp } = useGetFilteredPOIsQuery({ page: 1, limit: 500, isActive: true });
  const { user } = useSelector((state: RootState) => state.auth);
  const [isLoginOpen, setIsLoginOpen] = React.useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = React.useState(false);
  // Viewer (popup) pour images/vidéos
  const [viewerOpen, setViewerOpen] = React.useState(false);
  const [viewerSrc, setViewerSrc] = React.useState<string | null>(null);
  const [viewerKind, setViewerKind] = React.useState<'image' | 'video' | 'virtualtour'>('image');
  
  // Route Management
  const [activeRouteId, setActiveRouteId] = React.useState<string | null>(null);
  const [lastTraceTime, setLastTraceTime] = React.useState<number>(0);
  const [hoveredPoiId, setHoveredPoiId] = React.useState<string | null>(null);
  
  // API hooks for route management
  const [startRoute, { isLoading: isStartingRoute }] = useStartRouteMutation();
  const [addTrace, { isLoading: isAddingTrace }] = useAddVisitedTraceMutation();
  const [removePOI, { isLoading: isRemovingPOI }] = useRemovePOIFromRouteMutation();
  
  // Fetch active route details
  const { data: activeRouteData, refetch: refetchRoute } = useGetRouteByIdQuery(activeRouteId || '', {
    skip: !activeRouteId,
    pollingInterval: 5000, // Refresh every 5 seconds
    refetchOnMountOrArgChange: false,
  });
  
  // GPS Tracking
  const { position: userPosition, error: gpsError, startTracking, stopTracking } = useGPSTracker(true);

  // Automatic GPS trace sending when route is active
  React.useEffect(() => {
    if (!activeRouteId || !userPosition) return;

    const sendGPSTrace = async () => {
      const now = Date.now();
      if (now - lastTraceTime < 30000) return; // Every 30 seconds

      try {
        console.log('📍 Sending automatic GPS trace');
        await addTrace({
          routeId: activeRouteId,
          latitude: userPosition.coords.latitude,
          longitude: userPosition.coords.longitude,
        }).unwrap();
        setLastTraceTime(now);
      } catch (error) {
        console.error('Failed to send GPS trace:', error);
      }
    };

    sendGPSTrace();
    const interval = setInterval(sendGPSTrace, 30000);
    return () => clearInterval(interval);
  }, [activeRouteId, userPosition, lastTraceTime, addTrace]);

  // Debug logging for GPS and user
  React.useEffect(() => {
    console.log('[GPS Debug] User Position:', userPosition);
    console.log('[GPS Debug] GPS Error:', gpsError);
    console.log('[GPS Debug] User Data:', user);
    console.log('[GPS Debug] Profile Image:', user?.profileImage);
    
    // Check browser permissions API if available
    if (typeof navigator !== 'undefined' && 'permissions' in navigator) {
      (navigator.permissions as any).query({ name: 'geolocation' })
        .then((result: any) => {
          console.log('[GPS Debug] Permission status:', result.state);
          // Listen for permission changes
          result.onchange = () => {
            console.log('[GPS Debug] Permission changed to:', result.state);
          };
        })
        .catch((err: any) => {
          console.log('[GPS Debug] Could not check permissions:', err);
        });
    }
    
    // Show helpful message if no profile image
    if (user && !user.profileImage) {
      console.log('💡 [Profile Image] No profile image found. Upload one in your profile settings.');
    }
  }, [userPosition, gpsError, user]);

  // Start GPS tracking when component mounts and request permission
  React.useEffect(() => {
    const initGPS = async () => {
      if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        console.log('[GPS] Initializing GPS tracking...');
        
        // Start tracking immediately - it will handle permissions internally
        startTracking();
        
        // Also try to get an immediate position with a shorter timeout
        // This helps speed up initial positioning but doesn't block if it fails
        try {
          const quickPosition = await Promise.race([
            new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: false, // Use lower accuracy for faster response
                timeout: 5000, // Shorter timeout
                maximumAge: 30000 // Accept cached position up to 30 seconds old
              });
            }),
            new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error('Quick position timeout')), 5000)
            )
          ]);
          console.log('[GPS] Quick initial position obtained:', {
            lat: quickPosition.coords.latitude,
            lng: quickPosition.coords.longitude,
            accuracy: quickPosition.coords.accuracy
          });
        } catch (err: any) {
          // This is fine - watchPosition will keep trying
          console.log('[GPS] Quick position not available, waiting for watchPosition...', err?.message);
        }
      } else {
        console.error('[GPS] Geolocation API not available in this browser');
      }
    };
    
    initGPS();
    return () => stopTracking();
  }, []);

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

  const normalizedPois = React.useMemo<NormalizedPOI[]>(() => {
    const toNumber = (v: any) => (v === null || v === undefined ? null : Number(v));
    const parseCoords = (c: any) => {
      if (!c) return { lat: null, lng: null };
      if (typeof c === 'string') {
        try { c = JSON.parse(c); } catch { return { lat: null, lng: null }; }
      }
      const lat = toNumber(c?.lat ?? c?.latitude);
      const lng = toNumber(c?.lng ?? c?.longitude);
      return { lat, lng };
    };
    const getLabel = (p: RawPOI) => {
      const locKey = (locale as 'fr' | 'en' | 'ar');
      const localized = (p as any)[`${locKey}Localization`]?.name;
      const fallback = p.frLocalization?.name || p.enLocalization?.name || p.arLocalization?.name || p.fr || p.en || p.ar;
      return (localized as string) || (fallback as string) || 'POI';
    };
    const apiPois: any[] = (fetchedAllPoisResp as any)?.data?.pois || (fetchedAllPoisResp as any)?.pois || [];
    const sourcePois: any[] = (Array.isArray(pois) && pois.length > 0) ? pois : apiPois;
    return (sourcePois || [])
      .map((raw) => {
        const { lat, lng } = parseCoords(raw.coordinates);
        const filesArr: any[] = Array.isArray((raw as any)?.files) ? (raw as any).files : [];
        const imageFile = filesArr.find((f: any) => String(f?.type || '').toLowerCase() === 'image');
        const firstImage = (raw as any)?.initialImage || imageFile?.fileUrl;
        return {
          id: String(raw?.id ?? ''),
          label: getLabel(raw),
          lat: lat as number,
          lng: lng as number,
          img: firstImage,
          order: Number(raw?.CircuitPOI?.order ?? Number.MAX_SAFE_INTEGER),
          raw,
        } as NormalizedPOI;
      })
      .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng))
      .sort((a, b) => a.order - b.order);
  }, [pois, locale, fetchedAllPoisResp]);

  const filteredPois = React.useMemo(() => {
    if (!searchQuery.trim()) return normalizedPois;
    const q = searchQuery.toLowerCase();
    return normalizedPois.filter(p => p.label.toLowerCase().includes(q));
  }, [normalizedPois, searchQuery]);

  const handleSelectPoi = React.useCallback(async (poi: NormalizedPOI) => {
    try {
      setSelectedPoiId(poi.id);
      if (mapRef.current) {
        try {
          mapRef.current.flyTo({ center: [poi.lng, poi.lat], zoom: 16, speed: 1.2, curve: 1 });
        } catch {}
      }
    } catch {}
  }, []);

  const handleBackToList = React.useCallback(() => {
    setSelectedPoiId(null);
  }, []);

  const center = React.useMemo(() => {
    // Prefer user position if available
    if (userPosition) {
      return { 
        latitude: userPosition.coords.latitude, 
        longitude: userPosition.coords.longitude 
      };
    }
    // Otherwise use first POI
    if (normalizedPois.length > 0) {
      return { latitude: normalizedPois[0].lat, longitude: normalizedPois[0].lng };
    }
    // Default to Fès
    return { latitude: DEFAULT_CENTER.lat, longitude: DEFAULT_CENTER.lng };
  }, [normalizedPois, userPosition]);

  // Center map on user position when GPS becomes available
  React.useEffect(() => {
    if (userPosition && mapRef.current && !hasInitiallyPositioned.current) {
      console.log('[GPS] Centering map on user position');
      mapRef.current.flyTo({
        center: [userPosition.coords.longitude, userPosition.coords.latitude],
        zoom: 14,
        duration: 2000
      });
      hasInitiallyPositioned.current = true;
    }
  }, [userPosition]);

  const startRouteAnimation = (coordsRaw: number[][]) => {
    const valid = (c: any) => Array.isArray(c) && Number.isFinite(c[0]) && Number.isFinite(c[1]);
    const coords = (coordsRaw || []).filter(valid);
    if (!coords || coords.length < 2) {
      setRouteAnimatedGeoJSON(null);
      return;
    }
    if (routeAnimFrameRef.current) cancelAnimationFrame(routeAnimFrameRef.current);
    const duration = 1000;
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

  const buildConnectors = (lineGeometry: any, ordered: NormalizedPOI[]) => {
    if (!lineGeometry || !lineGeometry.coordinates || lineGeometry.coordinates.length < 2) return null;
    const coords = lineGeometry.coordinates;
    const features: any[] = [];
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
    for (const poi of ordered) {
      const p = [poi.lng, poi.lat];
      let best: number[] | null = null;
      let bestDist2 = Infinity;
      for (let i = 0; i < coords.length - 1; i++) {
        const a = coords[i];
        const b = coords[i + 1];
        const q: any = nearestPointOnSegment(p, a, b);
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

  const [connectorsGeoJSON, setConnectorsGeoJSON] = React.useState<any>(null);

  React.useEffect(() => {
    if (normalizedPois.length === 0) {
      setRouteGeoJSON(null);
      setRouteAnimatedGeoJSON(null);
      setConnectorsGeoJSON(null);
      return;
    }
    (async () => {
      try {
        // Build coordinates array: start with user position if available, then POIs
        const coordsArray: string[] = [];
        
        // Add user position as starting point if available
        if (userPosition) {
          coordsArray.push(`${userPosition.coords.longitude},${userPosition.coords.latitude}`);
        }
        
        // Add all POIs
        normalizedPois.forEach(p => {
          coordsArray.push(`${p.lng},${p.lat}`);
        });
        
        // Need at least 2 points to create a route
        if (coordsArray.length < 2) {
          setRouteGeoJSON(null);
          setRouteAnimatedGeoJSON(null);
          setConnectorsGeoJSON(null);
          return;
        }
        
        const coords = coordsArray.join(';');
        const url = `https://routing.openstreetmap.de/routed-foot/route/v1/foot/${coords}?overview=full&geometries=geojson&steps=false&annotations=false&alternatives=false`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`OSRM error ${res.status}`);
        const data = await res.json();
        if (data.code !== 'Ok' || !data.routes || !data.routes[0]) throw new Error('Itinéraire introuvable');
        const line = data.routes[0].geometry; // GeoJSON LineString
        const fc = { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: line }] };
        setRouteGeoJSON(fc);
        setConnectorsGeoJSON(buildConnectors(line, normalizedPois));
        try { startRouteAnimation(line.coordinates as number[][]); } catch {}
        const coordsArr = line.coordinates as number[][];
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
      } catch (_) {
        // pas de route
      }
    })();
    return () => {
      if (routeAnimFrameRef.current) cancelAnimationFrame(routeAnimFrameRef.current);
    };
  }, [normalizedPois, userPosition]);

  // Données circuit (header du sidebar)
  const header = React.useMemo(() => {
    const circuitAny = circuit || {};
    const imageUrl = circuitAny.image || '/images/hero.jpg';
    const cityName = circuitAny.city?.name || circuitAny.city?.nameEn || circuitAny.city?.nameAr || '';
    const rating = Number(circuitAny.rating || 0);
    const reviewCount = Number(circuitAny.reviewCount || 0);
    const reviews: any[] = Array.isArray(circuitAny.reviews) ? circuitAny.reviews : [];
    const firstReview = reviews.find((r) => !!r?.comment) || reviews[0];
    const locData = circuitAny?.[locale as 'fr' | 'en' | 'ar'];
    const frData = circuitAny?.fr;
    const name = (typeof locData === 'object' && locData?.name)
      ? locData.name
      : (typeof frData === 'object' && frData?.name) ? frData.name : (circuitAny.name || 'Circuit');
    const langBadge = locale?.toUpperCase?.() || 'FR';
    return { imageUrl, cityName, rating, reviewCount, firstReview, name, langBadge };
  }, [circuit, locale]);

  const handleShare = React.useCallback(async () => {
    if (!circuit) return;

    const url = typeof window !== 'undefined' ? window.location.href : '';
    const title = header?.name as string;

    try {
      const navAny: any = typeof navigator !== 'undefined' ? (navigator as any) : undefined;
      if (navAny && typeof navAny.share === 'function') {
        await navAny.share({ title, url });
      } else if (typeof navigator !== 'undefined' && navigator.clipboard && url) {
        await navigator.clipboard.writeText(url);
        alert('Lien copié dans le presse-papiers !');
      }
    } catch (err) {
      // Si l'utilisateur annule le partage ou en cas d'erreur
      console.log('Partage annulé ou erreur:', err);
    }
  }, [circuit, header]);

  // Demander la permission de géolocalisation avant de démarrer
  const requestGeolocationPermission = React.useCallback(async (): Promise<boolean> => {
    if (typeof navigator === 'undefined' || !(navigator as any)?.geolocation) return false;
    try {
      // Tente une lecture pour déclencher le prompt le cas échéant
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        try {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
        } catch (e) {
          reject(e);
        }
      });
      return !!pos;
    } catch (_) {
      return false;
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-col md:flex-row w-full h-screen overflow-hidden border border-border bg-background",
        isFullscreen && "fixed inset-0 z-[1000] w-screen h-screen rounded-none"
      )}
    >
      {/* Sidebar (liste ou détail POI) */}
      <div className="order-2 md:order-none w-full md:w-[380px] h-[45vh] md:h-full overflow-y-auto border-t md:border-t-0 md:border-r border-border bg-card">
        <div className="p-4 border-b border-border sticky top-0 bg-card z-10">
          <div className="relative flex items-center gap-3 justify-center ">
            <div className="w-20 h-20 rounded-tl-lg rounded-br-lg overflow-hidden border border-border bg-muted flex-shrink-0">
              <img src={header.imageUrl} alt={header.name} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0 flex-1 h-full w-full flex flex-col justify-between align-center">
              {header.cityName && (
                <div className="text-xs text-muted-foreground truncate">{header.cityName}</div>
              )}
              <div className="flex items-center gap-2 min-w-0">
                <h3 className="font-bold text-base truncate">{header.name}</h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-foreground border">{header.langBadge}</span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-sm">
                <span className="inline-flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" /> {header.rating.toFixed(1)}
                </span>
                <span className="text-muted-foreground">( {header.reviewCount} reviews )</span>
              </div>
            </div>
          </div>
          
 
          {!selectedPoiId && header.firstReview?.comment && (
            <div className="mt-3 text-sm bg-muted/40 border border-border rounded-md p-3">
              <div className="line-clamp-3 text-foreground">{header.firstReview.comment}</div>
              <div className="flex justify-end mt-2">
                <Button variant="ghost" size="sm" className="h-7 text-xs px-2">Voir plus</Button>
              </div>
            </div>
          )}
          
          {!selectedPoiId && (
            <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 rounded-md border bg-background p-2">
              <MapIcon className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">{circuit?.distance ?? '-'} km</span>
            </div>
            <div className="flex items-center gap-2 rounded-md border bg-background p-2">
              <ClockIcon className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">{circuit?.duration ?? '-'} min</span>
            </div>
          </div>
          )}

          {!selectedPoiId && (
          <div className="mt-4 flex flex-col gap-2">
            {/* GPS Status and Controls */}
            {circuit?.id && (
              <>
                {gpsError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-800 text-sm mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">GPS Error</span>
                    </div>
                    <p className="text-xs text-red-700 mb-2">{gpsError?.message || 'GPS error occurred'}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-red-300 text-red-700 hover:bg-red-50"
                      onClick={() => {
                        stopTracking();
                        setTimeout(() => startTracking(), 100);
                        toast.info('Retrying GPS...');
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                      </svg>
                      Retry GPS
                    </Button>
                  </div>
                )}
                
                {!userPosition && !gpsError && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2 text-amber-800 text-sm mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">GPS Required</span>
                    </div>
                    <p className="text-xs text-amber-700 mb-2">Please enable GPS to start navigation</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
                      onClick={async () => {
                        const granted = await requestGeolocationPermission();
                        if (granted) {
                          toast.success('GPS enabled successfully');
                          startTracking();
                        } else {
                          toast.error('GPS permission denied. Please enable location in your browser settings.');
                        }
                      }}
                    >
                      <Navigation className="w-3 h-3 mr-2" />
                      Enable GPS
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              {circuit?.id && (
                <Button
                  type="button"
                  size="sm"
                  className="h-9 px-6 rounded-tl-xl rounded-br-xl rounded-bl-none rounded-tr-none bg-green-800 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={async () => {
                    if (!user) {
                      setIsLoginOpen(true);
                      toast.error('Veuillez vous connecter pour démarrer le circuit');
                      return;
                    }
                    if (!userPosition) {
                      toast.error('Waiting for GPS location. Please enable GPS and try again.');
                      return;
                    }
                    // Start route directly
                    try {
                      const result = await startRoute({
                        circuitId: circuit.id,
                        latitude: userPosition.coords.latitude,
                        longitude: userPosition.coords.longitude,
                      }).unwrap();
                      
                      if (result.status && result.data?.firstTrace) {
                        const newRouteId = result.data.firstTrace.routeId;
                        // Navigate to route page
                        router.push(`/circuits/rout/${newRouteId}`);
                        toast.success('Route started! Redirecting to navigation...');
                      }
                    } catch (error: any) {
                      console.error('Failed to start route:', error);
                      toast.error(error?.data?.message || 'Failed to start route');
                    }
                  }}
                  disabled={!userPosition || !!gpsError || isStartingRoute}
                >
                  <Navigation className="w-3 h-3 mr-2" />
                  {isStartingRoute ? 'Starting...' : 'Start'}
                </Button>
              )}
              {/* ajoutez fonctionaliter de patage  */}
              <Button variant="ghost" size="sm" className="h-9 px-6 rounded-tl-xl rounded-br-xl rounded-bl-none rounded-tr-none bg-white text-black border border-green-500 w-full" onClick={handleShare}>
                <Share className="w-3 h-3 mr-2" />
                Share
              </Button>
            </div>
          </div>
          )}

          {!selectedPoiId ? (
            <>
              <h4 className="mt-5 font-semibold">Étapes du circuit</h4>
              <p className="text-xs text-muted-foreground">Affichage uniquement (ordre serveur)</p>
            </>
          ) : (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-3">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleBackToList}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h4 className="font-semibold">Détail du POI</h4>
              </div>
              {isFetchingPoi ? (
                <div className="text-sm text-muted-foreground">Chargement...</div>
              ) : (
                (() => {
                  const poi: any = fetchedPoiData?.poi;
                  if (!poi) return <div className="text-sm text-muted-foreground">Aucune donnée</div>;
                  const primaryImage = Array.isArray(poi.files)
                    ? (poi as any).initialImage || poi.files.find((f: any) => String(f?.type || '').toLowerCase() === 'image')?.fileUrl
                    : (poi as any)?.initialImage;
                  const img = primaryImage;
                  const label = poi?.frLocalization?.name || poi?.enLocalization?.name || poi?.arLocalization?.name || 'POI';
                  const address = poi?.coordinates?.address || poi?.city?.name || '';
                  const desc = poi?.frLocalization?.description || poi?.enLocalization?.description || poi?.arLocalization?.description || '';

                  // Audio (selon langue sélectionnée)
                  const locKey = (locale as 'fr' | 'en' | 'ar');
                  const locObj = poi?.[`${locKey}Localization`] || poi?.frLocalization || poi?.enLocalization || poi?.arLocalization || null;
                  const audioFilesRaw = locObj?.audioFiles;
                  let audioUrl: string | null = null;
                  try {
                    if (typeof audioFilesRaw === 'string') {
                      const arr = JSON.parse(audioFilesRaw);
                      if (Array.isArray(arr) && arr[0]?.url) audioUrl = arr[0].url;
                    } else if (Array.isArray(audioFilesRaw)) {
                      audioUrl = audioFilesRaw[0]?.url || null;
                    }
                  } catch {}

                  // Images & Vidéos (toutes)
                  const imageFiles: any[] = Array.isArray(poi.files)
                    ? poi.files.filter((f: any) => String(f?.type || '').toLowerCase() === 'image')
                    : [];
                  const videoFiles: any[] = Array.isArray(poi.files)
                    ? poi.files.filter((f: any) => String(f?.type || '').toLowerCase() === 'video')
                    : [];
                  const mediaFiles: any[] = [...imageFiles, ...videoFiles];

                  // Virtual tour (iframe)
                  const virtualTour: any = Array.isArray(poi.files)
                    ? poi.files.find((f: any) => String(f?.type || '').toLowerCase() === 'virtualtour')
                    : null;

                  // Catégorie (nom localisé + icône)
                  const parseLoc = (val: any) => {
                    if (!val) return null;
                    if (typeof val === 'string') {
                      try { return JSON.parse(val); } catch { return null; }
                    }
                    return typeof val === 'object' ? val : null;
                  };
                  const cat = poi?.categoryPOI;
                  const catName = parseLoc(cat?.[locKey])?.name || parseLoc(cat?.fr)?.name || parseLoc(cat?.en)?.name || parseLoc(cat?.ar)?.name || '';

                  // Ville (nom + image)
                  const cityName = locKey === 'ar' ? poi?.city?.nameAr : (locKey === 'en' ? poi?.city?.nameEn : poi?.city?.name);
                  const cityImage = poi?.city?.image;

                  return (
                    <div className="space-y-3">
                      {img && (
                        <div className="w-full h-40 rounded-md overflow-hidden border">
                          <img src={img} alt={label} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div>
                        <div className="text-sm text-muted-foreground">{address}</div>
                        <div className="text-lg font-semibold">{label}</div>
                      </div>
                      {desc && <p className="text-sm leading-relaxed text-foreground/90">{desc}</p>}

                      {audioUrl && (
                        <div className="mt-2">
                          <audio controls className="w-full">
                            <source src={audioUrl} />
                            Votre navigateur ne supporte pas l'élément audio.
                          </audio>
                        </div>
                      )}

                      {mediaFiles.length > 0 && (
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          {mediaFiles.map((f: any) => {
                            const isImg = String(f?.type || '').toLowerCase() === 'image';
                            const isVid = String(f?.type || '').toLowerCase() === 'video';
                            return (
                              <div
                                key={f.id || f.fileUrl}
                                className="w-full aspect-video rounded overflow-hidden border relative cursor-pointer"
                                onClick={() => { setViewerKind(isVid ? 'video' : 'image'); setViewerSrc(f.fileUrl); setViewerOpen(true); }}
                              >
                                {isImg ? (
                                  <img src={f.fileUrl} alt={label} className="w-full h-full object-cover" />
                                ) : (
                                  <video src={f.fileUrl} className="w-full h-full object-cover" muted playsInline />
                                )}
                                {isVid && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-white text-xl">
                                    ▶
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {virtualTour?.fileUrl && (
                        <div className="mt-3">
                          <iframe
                            src={virtualTour.fileUrl}
                            className="w-full h-56 rounded border"
                            allow="accelerometer; gyroscope; fullscreen"
                          />
                        </div>
                      )}

                      {cat && (
                        <div className="mt-3 flex items-center gap-2">
                          {cat.icon && <img src={cat.icon} alt={catName || 'Catégorie'} className="w-6 h-6 object-contain" />}
                          <div className="text-sm text-muted-foreground">
                            Catégorie: <span className="font-medium text-foreground">{catName}</span>
                          </div>
                        </div>
                      )}

                      {poi?.city && (
                        <div className="mt-3 flex items-center gap-2">
                          {cityImage && (
                            <img src={cityImage} alt={cityName || 'Ville'} className="w-10 h-10 rounded object-cover border" />
                          )}
                          <div className="text-sm text-muted-foreground">
                            Ville: <span className="font-medium text-foreground">{cityName}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}
            </div>
          )}
        </div>
        
        {!selectedPoiId && (
        <div>
          {/* Barre de recherche */}
          <div className="p-3 border-b border-border sticky top-[72px] bg-card z-10">
            <div className="relative">
              <Input
                type="text"
                placeholder="Rechercher un POI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-3 h-9"
              />
            </div>
          </div>

          {filteredPois.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">Aucun POI</div>
          ) : (
            filteredPois.map((poi, index) => {
              const isStart = index === 0;
              const isEnd = index === filteredPois.length - 1;
              return (
                <div key={poi.id} className="flex items-center gap-3 p-3 border-b border-border bg-card cursor-pointer" onClick={() => handleSelectPoi(poi)}>
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-border shadow-sm bg-muted">
                      {poi.img ? (
                        <img src={poi.img} alt={poi.label} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">POI</div>
                      )}
                    </div>
                    {isStart && (
                      <div className="absolute -top-1 -right-1 bg-white text-green-600 rounded-full p-1 shadow">
                        <MapPinIcon className="w-3.5 h-3.5" />
                      </div>
                    )}
                    {isEnd && normalizedPois.length > 1 && (
                      <div className="absolute -top-1 -right-1 bg-white text-red-600 rounded-full p-1 shadow">
                        <FlagIcon className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm truncate">{poi.label}</span>
                      <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary ml-auto">#{index + 1}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{poi.lat.toFixed(4)}, {poi.lng.toFixed(4)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
        )}
      </div>

      {/* Carte */}
      <div className="order-1 md:order-none relative md:flex-1 h-[55vh] md:h-full">
        {/* GPS Status Indicator */}
        {gpsError && (
          <div className="absolute top-3 left-3 z-[1010] bg-red-500 text-white px-3 py-2 rounded-lg shadow-lg text-sm max-w-xs">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4" />
              <div className="flex flex-col">
                <span className="font-semibold">GPS Error</span>
                <span className="text-xs opacity-90">
                  {gpsError.code === 1 ? 'Permission denied - Enable location in browser settings' :
                   gpsError.code === 2 ? 'Position unavailable - Check GPS signal' :
                   gpsError.code === 3 ? 'Request timeout - Retrying...' :
                   gpsError.message || 'Unknown error'}
                </span>
              </div>
            </div>
          </div>
        )}
        {!gpsError && !userPosition && (
          <div className="absolute top-3 left-3 z-[1010] bg-blue-500 text-white px-3 py-2 rounded-lg shadow-lg text-sm">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 animate-pulse" />
              <div className="flex flex-col">
                <span className="font-semibold">Acquiring GPS position...</span>
                <span className="text-xs opacity-90">May take 10-30 seconds</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Refresh GPS button */}
        {gpsError && (
          <div className="absolute top-20 left-3 z-[1010]">
            <Button
              type="button"
              size="sm"
              onClick={async () => {
                console.log('[GPS] Manual refresh requested');
                stopTracking();
                
                // Try to get permission again
                if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
                  try {
                    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                      navigator.geolocation.getCurrentPosition(
                        resolve,
                        reject,
                        {
                          enableHighAccuracy: true,
                          timeout: 10000,
                          maximumAge: 0
                        }
                      );
                    });
                    console.log('[GPS] Manual position obtained:', pos);
                  } catch (err: any) {
                    console.error('[GPS] Manual position error:', err);
                    alert('GPS Error: ' + (err?.message || 'Please check your browser location settings'));
                  }
                }
                
                setTimeout(() => startTracking(), 100);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Retry GPS
            </Button>
          </div>
        )}
        
        <div className="absolute top-12 right-3 z-[1010] flex gap-2">
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
          initialViewState={{ latitude: center.latitude, longitude: center.longitude, zoom: DEFAULT_ZOOM }}
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
              {/* Ligne principale (au-dessus) */}
              <Source id="route" type="geojson" data={routeAnimatedGeoJSON || routeGeoJSON}>
                <Layer
                  id="route-line"
                  type="line"
                  paint={{
                    'line-color': 'green',
                    'line-width': 4,
                    'line-opacity': 0.9
                  }}
                  layout={{ 'line-cap': 'round', 'line-join': 'round' }}
                />
              </Source>
              {/* Liaisons POI -> route (pointillés) */}
              {connectorsGeoJSON && connectorsGeoJSON.features?.length > 0 && (
                <Source id="poi-connectors" type="geojson" data={connectorsGeoJSON}>
                  <Layer
                    id="poi-connector"
                    type="line"
                    paint={{ 'line-color': '#3593eb', 'line-width': 2, 'line-opacity': 0.6, 'line-dasharray': [2, 2] }}
                  />
                </Source>
              )}
            </>
          )}

          {/* Markers avec image + numéro */}
          {normalizedPois.map((poi, index) => {
            const isStart = index === 0;
            const isEnd = index === normalizedPois.length - 1;
            
            // Check if this POI is visited or removed
            const routeData: any = activeRouteData?.data;
            const visitedTraces = routeData?.visitedTraces || [];
            const removedTraces = routeData?.removedTraces || [];
            const isVisited = visitedTraces.some(trace => trace.idPoi === poi.id);
            const isRemoved = removedTraces.some(trace => trace.idPoi === poi.id);
            const isHovered = hoveredPoiId === poi.id;
            
            return (
              <Marker key={poi.id} longitude={poi.lng} latitude={poi.lat} anchor="bottom">
                <div 
                  className="relative"
                  onMouseEnter={() => setHoveredPoiId(poi.id)}
                  onMouseLeave={() => setHoveredPoiId(null)}
                >
                  {/* POI Marker */}
                  <div 
                    className={cn(
                      "w-12 h-12 border-2 rounded-full overflow-hidden shadow-xl cursor-pointer transition-all relative",
                      isVisited ? "border-green-500 bg-green-50 opacity-70" : 
                      isRemoved ? "border-gray-400 bg-gray-100 opacity-40 grayscale" : 
                      "border-primary bg-accent",
                      isHovered && !isRemoved && "scale-110"
                    )}
                    onClick={() => !isRemoved && handleSelectPoi(poi)}
                  >
                    <img 
                      src={poi.img || 'https://placehold.co/100x100?text=POI'} 
                      alt={poi.label} 
                      className={cn(
                        "w-full h-full object-cover transition-all",
                        isRemoved && "opacity-50"
                      )}
                    />
                    
                    {/* Cross overlay for removed POIs */}
                    {isRemoved && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  {/* POI Number Badge */}
                  <div className={cn(
                    "absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md",
                    isVisited ? "bg-green-500 text-white" : 
                    isRemoved ? "bg-gray-400 text-white" : 
                    "bg-primary text-primary-foreground"
                  )}>
                    {isVisited ? '✓' : isRemoved ? '✕' : index + 1}
                  </div>
                  
                  {/* Start/End Indicators */}
                  {isStart && (
                    <div className="absolute -top-1 -right-1 bg-white text-green-600 rounded-full p-1 shadow">
                      <MapPinIcon className="w-3.5 h-3.5" />
                    </div>
                  )}
                  {isEnd && normalizedPois.length > 1 && (
                    <div className="absolute -top-1 -right-1 bg-white text-red-600 rounded-full p-1 shadow">
                      <FlagIcon className="w-3.5 h-3.5" />
                    </div>
                  )}
                  
                  {/* POI Name Label on Hover */}
                  {isHovered && (
                    <div className={cn(
                      "absolute top-full mt-2 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg shadow-lg text-xs font-medium whitespace-nowrap z-10",
                      isRemoved ? "bg-gray-100 text-gray-600" : "bg-white text-gray-800"
                    )}>
                      <div className="flex items-center gap-1.5">
                        <span>{poi.label}</span>
                        {isRemoved && (
                          <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                            Skipped
                          </span>
                        )}
                        {isVisited && (
                          <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                            Visited
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Marker>
            );
          })}

          {/* User Location Marker */}
          {userPosition && (
            <Marker 
              longitude={userPosition.coords.longitude} 
              latitude={userPosition.coords.latitude} 
              anchor="center"
            >
              <div className="relative">
                {/* Pulsing outer circle */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-full opacity-30 animate-ping"></div>
                </div>
                {/* User profile image */}
                <div className="relative w-12 h-12 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-blue-600">
                  {user && user.profileImage ? (
                    <img 
                      src={user.profileImage} 
                      alt={`${user.firstName || 'User'} ${user.lastName || ''}`}
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        console.error('[Profile Image] Failed to load:', user.profileImage);
                        // Hide the image on error and show fallback
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : null}
                  {(!user || !user.profileImage) && (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg bg-gradient-to-br from-blue-500 to-blue-700">
                      {user?.firstName?.[0]?.toUpperCase() || user?.lastName?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                {/* Location pin indicator */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-blue-600 text-white rounded-full p-1 shadow-lg">
                  <Navigation className="w-3 h-3" />
                </div>
              </div>
            </Marker>
          )}
        </Map>
      </div>

      {isLoginOpen && (
        <Login
          onClose={() => setIsLoginOpen(false)}
          onSwitchToSignUp={() => {
            setIsLoginOpen(false);
            setIsSignUpOpen(true);
          }}
          onSwitchToForgotPassword={() => setIsLoginOpen(false)}
        />
      )}
      {isSignUpOpen && (
        <SignUp
          onClose={() => setIsSignUpOpen(false)}
          onSwitchToLogin={() => {
            setIsSignUpOpen(false);
            setIsLoginOpen(true);
          }}
        />
      )}
      {/* Viewer popup (image / vidéo) */}
      {viewerOpen && viewerSrc && (
        <div
          className="fixed inset-0 z-[1200] bg-black/70 flex items-center justify-center p-4"
          onClick={() => { setViewerOpen(false); setViewerSrc(null); }}
        >
          <div
            className="relative bg-white rounded-lg w-full max-w-3xl max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute top-2 right-2 z-10 px-3 py-1 rounded-md bg-black/60 text-white text-sm"
              onClick={() => { setViewerOpen(false); setViewerSrc(null); }}
            >
              ×
            </button>
            {viewerKind === 'image' ? (
              <img src={viewerSrc} alt="media" className="w-full h-auto max-h-[85vh] object-contain" />
            ) : (
              <video src={viewerSrc} className="w-full h-auto max-h-[85vh]" controls autoPlay playsInline />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Auth modals (mounted at document end to avoid z-index/cropping issues)
// Rendered by parent; but we include here at the end of the component return above.


