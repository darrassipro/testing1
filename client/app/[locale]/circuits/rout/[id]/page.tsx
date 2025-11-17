"use client";

import React, { use, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import Map, { Marker, Source, Layer } from 'react-map-gl/maplibre';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useGetRouteByIdQuery, useAddVisitedTraceMutation, useRemovePOIFromRouteMutation, useAddPOIToRouteMutation } from '@/services/api/RouteApi';
import { MapPinIcon, FlagIcon, ChevronLeft, X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { GeoPoint, Zone, User, GeoUtils, Traject } from '@/lib/geo';
import { zoneToPolygon, computePassedSegment, buildConnectors, startRouteAnimation, getZoneRadiusForSpeed, getZoomForSpeed } from '@/lib/mapRouteUtils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useGetPOIByIdQuery } from '@/services/api/PoiApi';
import { skipToken } from '@reduxjs/toolkit/query';
import { cn } from '@/lib/utils';
import { CircuitCompletionModal } from '@/components/circuits/CircuitCompletionModal';

// Classes and general utilities are imported above

interface RoutePageProps {
	params: Promise<{
		locale: string;
		id: string;
	}>;
}

// ----- POIs et itinéraire -----
interface RawPOI {
	id?: string;
	coordinates?: string | { lat?: number; lng?: number; latitude?: number; longitude?: number };
	files?: Array<{ fileUrl?: string }>;
	frLocalization?: { name?: string } | null;
	enLocalization?: { name?: string } | null;
	arLocalization?: { name?: string } | null;
	CircuitPOI?: { order?: number | null } | null;
	[kk: string]: any;
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

export default function RoutePage({ params }: RoutePageProps) {
	const { id } = use(params);
	const authUser = useSelector((state: RootState) => state.auth.user as any);
	const [userObject, setUserObject] = useState<User | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const mapRef = useRef<any>(null);
	const { data: routeResp } = useGetRouteByIdQuery(id, { skip: !id });
	const [addVisitedTrace] = useAddVisitedTraceMutation();
	const [removePOI] = useRemovePOIFromRouteMutation();
	const [addPOI] = useAddPOIToRouteMutation();
	const initialUserRef = useRef<{ lat: number; lng: number } | null>(null);
	const [speedMs, setSpeedMs] = useState<number>(0);
	const osrmRequestedRef = useRef<boolean>(false);
	const speedResetTimerRef = useRef<number | null>(null);
	const [routeGeoJSON, setRouteGeoJSON] = useState<any>(null);
	const [routeAnimatedGeoJSON, setRouteAnimatedGeoJSON] = useState<any>(null);
	const routeAnimFrameRef = useRef<number | null>(null);
	const [connectorsGeoJSON, setConnectorsGeoJSON] = useState<any>(null);
	const [passedSegmentGeoJSON, setPassedSegmentGeoJSON] = useState<any>(null);
	const [userProjectedLngLat, setUserProjectedLngLat] = useState<{ lng: number; lat: number } | null>(null);
	const [afterRouteGeometry, setAfterRouteGeometry] = useState<any>(null);
	const afterStartRef = useRef<{ lng: number; lat: number } | null>(null);
	const [afterPoiOrderMap, setAfterPoiOrderMap] = useState<Record<string, number>>({});
	const [routeBeforeGeoJSON, setRouteBeforeGeoJSON] = useState<any>(null);
	const [routeAfterGeoJSON, setRouteAfterGeoJSON] = useState<any>(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedPoiId, setSelectedPoiId] = useState<string | null>(null);
	const [viewerOpen, setViewerOpen] = useState(false);
	const [viewerSrc, setViewerSrc] = useState<string | null>(null);
	const [viewerKind, setViewerKind] = useState<'image' | 'video' | 'virtualtour'>('image');
	const { data: fetchedPoiData, isFetching: isFetchingPoi } = useGetPOIByIdQuery(selectedPoiId ?? skipToken as any);
	const [notifiedPoiIds, setNotifiedPoiIds] = useState<Set<string>>(new Set());
	const notifiedPoiIdsRef = useRef<Set<string>>(new Set());
	const [poiVisitTimers, setPoiVisitTimers] = useState<Record<string, { startTime: number; remainingSeconds: number }>>({});
	const poiVisitTimersRef = useRef<Record<string, NodeJS.Timeout>>({});
	const [visitingPoiId, setVisitingPoiId] = useState<string | null>(null);
	const [completionModalOpen, setCompletionModalOpen] = useState(false);
	const [completionPoints, setCompletionPoints] = useState<{ totalPoints: number; pointsAwarded?: Array<{ activity: string; points: number; description: string }> } | null>(null);
	const MAP_STYLE = 'https://api.maptiler.com/maps/019a213d-06f4-7ef2-be61-48b4b8fb7e56/style.json?key=cKuGgc1qdSgluaz2JWLK';

	useEffect(() => {
		const buildUserFromData = async () => {
			const routeData = routeResp as any;
			if (!routeData?.data) return;
			console.log('Route GET by id result:', routeData);
			const firstTrace = routeData?.data?.visitedTraces?.[0];
			const prevLat = firstTrace ? Number(firstTrace.latitude) : undefined;
			const prevLon = firstTrace ? Number(firstTrace.longitude) : undefined;
			const prevPoint = (Number.isFinite(prevLat) && Number.isFinite(prevLon)) ? new GeoPoint(prevLat as number, prevLon as number) : undefined;

			if (!authUser?.id) return; // exiger un utilisateur connecté

			// Si un user existe déjà, ne pas le réinitialiser; ajouter startPoint s'il manque
			if (userObject) {
				if (!userObject.startPoint && prevPoint) {
					setUserObject(prev => {
						if (!prev || prev.startPoint) return prev;
						const next = new User({
							id: prev.id,
							name: prev.name,
							profileImageUrl: prev.profileImageUrl,
							currentLocation: prev.currentLocation,
							prevZone: prev.prevZone ?? null,
							currentZone: prev.currentZone ?? null,
							currentTraject: prev.currentTraject ?? null,
							prevTraject: prev.prevTraject ?? null,
							startPoint: prevPoint ?? null,
						});
						next.speed = prev.speed;
						next.avgSpeed = prev.avgSpeed;
						next.speedHistory = [...prev.speedHistory];
						next.lastLocationTimestamp = prev.lastLocationTimestamp;
						return next;
					});
				}
				return;
			}

			let currentPoint: GeoPoint | undefined;
			// Utiliser la trace la plus récente si disponible, sinon utiliser GPS
			const visitedTraces = routeData?.data?.visitedTraces || [];
			if (visitedTraces.length > 0) {
				// Trier par createdAt pour obtenir la trace la plus récente
				const sortedTraces = [...visitedTraces].sort((a: any, b: any) => {
					const dateA = new Date(a.createdAt || a.created_at || 0).getTime();
					const dateB = new Date(b.createdAt || b.created_at || 0).getTime();
					return dateB - dateA; // Plus récent en premier
				});
				const latestTrace = sortedTraces[0];
				const latestLat = Number(latestTrace.latitude);
				const latestLon = Number(latestTrace.longitude);
				if (Number.isFinite(latestLat) && Number.isFinite(latestLon)) {
					const traceTimestamp = latestTrace.createdAt || latestTrace.created_at;
					const timestamp = traceTimestamp ? new Date(traceTimestamp).getTime() : Date.now();
					currentPoint = new GeoPoint(latestLat, latestLon, timestamp, 10); // accuracy de 10m par défaut
					console.log('Using latest visited trace for initial position:', { lat: latestLat, lng: latestLon, timestamp });
				}
			}
			
			// Fallback sur GPS si aucune trace valide n'est trouvée
			if (!currentPoint) {
				try {
					const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
						navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
					});
					currentPoint = new GeoPoint(pos.coords.latitude, pos.coords.longitude, Date.now(), pos.coords.accuracy);
					console.log('Using GPS for initial position:', { lat: pos.coords.latitude, lng: pos.coords.longitude });
				} catch {}
			}

			const prevZone = prevPoint ? new Zone({ id: `prev-${Date.now()}`, center: prevPoint, radiusMeters: 200, type: 'fixed', name: 'Previous Zone' }) : null;
			const currentZone = currentPoint ? new Zone({ id: `realtime-${Date.now()}`, center: currentPoint, radiusMeters: 100, type: 'realtime', name: 'Realtime Zone' }) : null;

			const u = new User({
				id: String(authUser.id),
				name: `${authUser.firstName ?? ''} ${authUser.lastName ?? ''}`.trim(),
				profileImageUrl: authUser?.profileImage ?? undefined,
				currentLocation: currentPoint,
				prevZone,
				currentZone,
				currentTraject: null,
				prevTraject: null,
				startPoint: prevPoint ?? null,
			});
			setUserObject(u);
			if (currentPoint) initialUserRef.current = { lat: currentPoint.latitude, lng: currentPoint.longitude };
			console.log('User initialisé:', u);
			if (currentPoint) setLoading(false);
		};
		buildUserFromData();
	}, [routeResp, authUser]);

	const center = useMemo(() => {
		if (userObject?.currentLocation) {
			return { latitude: userObject.currentLocation.latitude, longitude: userObject.currentLocation.longitude };
		}
		return undefined as any; // non utilisé tant que loading est vrai
	}, [userObject]);

	const prevZoneGeoJSON = useMemo(() => zoneToPolygon(userObject?.prevZone ?? null), [userObject]);
	const currentZoneGeoJSON = useMemo(() => zoneToPolygon(userObject?.currentZone ?? null), [userObject]);
	const startFromUser = useMemo(() => userObject?.startPoint ? { lat: userObject.startPoint.latitude, lng: userObject.startPoint.longitude } : null, [userObject?.startPoint]);
	const hasRouteParts = useMemo(() => {
		return !!(routeBeforeGeoJSON || routeAfterGeoJSON);
	}, [routeBeforeGeoJSON, routeAfterGeoJSON]);

	// Zones et zoom en fonction de la vitesse => importés depuis utils

	// Normaliser les POIs depuis la réponse route
	const normalizedPois = useMemo<NormalizedPOI[]>(() => {
		const pois: RawPOI[] = (routeResp as any)?.data?.pois || [];
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
		const getLabel = (p: RawPOI) => p?.frLocalization?.name || p?.enLocalization?.name || p?.arLocalization?.name || 'POI';
		return (pois || [])
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
				};
			})
			.filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));
	}, [routeResp]);

	// Déterminer le point de départ (premier visitedTrace) et créer un ordre par proximité (nearest neighbor)
	const startVisitedPoint = useMemo(() => {
		const firstTrace = (routeResp as any)?.data?.visitedTraces?.[0];
		if (!firstTrace) return null;
		const lat = Number(firstTrace.latitude);
		const lng = Number(firstTrace.longitude);
		if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
		return { lat, lng };
	}, [routeResp]);

	// Filtrer les POIs retirés pour orderedPois (pour le calcul du traject)
	const activePoisForRoute = useMemo(() => {
		const routeData = routeResp as any;
		const removedTraces = routeData?.data?.removedTraces || [];
		const removedPoiIds = new Set(
			removedTraces.map((t: any) => String(t.poiId || '')).filter(Boolean)
		);
		return normalizedPois.filter(p => !removedPoiIds.has(String(p.id)));
	}, [normalizedPois, routeResp]);

	// Récupérer les traces visitées et retirées pour déterminer l'état des POIs
	const routeData = routeResp as any;
	const visitedTraces = routeData?.data?.visitedTraces || [];
	const removedTraces = routeData?.data?.removedTraces || [];
	const visitedPoiIds = useMemo(() => new Set(
		visitedTraces.map((t: any) => String((t.poiId ?? t.idPoi ?? '') || '')).filter(Boolean)
	), [visitedTraces]);
	const removedPoiIds = useMemo(() => new Set(
		removedTraces.map((t: any) => String(t.poiId || '')).filter(Boolean)
	), [removedTraces]);

	const orderedPois = useMemo<NormalizedPOI[]>(() => {
		// Filtrer les POIs visités pour ne calculer le trajectoire que pour les POIs restants
		const remainingPois = activePoisForRoute.filter(p => !visitedPoiIds.has(String(p.id)));
		if (!remainingPois.length) return [];
		const anchor = startFromUser || startVisitedPoint || (userObject?.currentLocation ? { lat: userObject.currentLocation.latitude, lng: userObject.currentLocation.longitude } : null);
		if (!anchor) return remainingPois.slice().sort((a, b) => a.order - b.order);
		const remaining = remainingPois.slice();
		const path: NormalizedPOI[] = [];
		let cur = { lat: anchor.lat, lng: anchor.lng };
		const dist = (a: {lat:number;lng:number}, b: {lat:number;lng:number}) => {
			const dlat = a.lat - b.lat; const dlng = a.lng - b.lng; return dlat*dlat + dlng*dlng;
		};
		while (remaining.length) {
			let bestIdx = 0; let bestD = Infinity;
			for (let i = 0; i < remaining.length; i++) {
				const d = dist(cur, { lat: remaining[i].lat, lng: remaining[i].lng });
				if (d < bestD) { bestD = d; bestIdx = i; }
			}
			const [next] = remaining.splice(bestIdx, 1);
			path.push(next);
			cur = { lat: next.lat, lng: next.lng };
		}
		return path;
	}, [activePoisForRoute, startVisitedPoint, startFromUser, userObject, visitedPoiIds]);

	// Filtrage des POIs par recherche (utiliser normalizedPois pour afficher tous les POIs, y compris retirés)
	const filteredPois = useMemo(() => {
		if (!searchQuery.trim()) return normalizedPois;
		const q = searchQuery.toLowerCase();
		return normalizedPois.filter(p => p.label.toLowerCase().includes(q));
	}, [normalizedPois, searchQuery]);

	// Gestion de la sélection de POI
	const handleSelectPoi = React.useCallback((poi: NormalizedPOI) => {
		setSelectedPoiId(poi.id);
		if (mapRef.current) {
			try {
				mapRef.current.flyTo({ center: [poi.lng, poi.lat], zoom: 16, speed: 1.2, curve: 1 });
			} catch {}
		}
	}, []);

	const handleBackToList = React.useCallback(() => {
		setSelectedPoiId(null);
	}, []);

	// Fonction pour recalculer le traject (utiliser useRef pour éviter les dépendances)
	const recalculateTrajectRef = useRef<(() => Promise<void>) | null>(null);
	const recalculateTraject = React.useCallback(async () => {
		if (!orderedPois.length || !userObject?.currentLocation) return;
		
		const start = startFromUser || startVisitedPoint;
		const userPosStatic = initialUserRef.current;
		
		if (orderedPois.length === 0) {
			setRouteGeoJSON(null);
			setConnectorsGeoJSON(null);
			setRouteAnimatedGeoJSON(null);
			return;
		}

		try {
			const parts: string[] = [];
			if (start) parts.push(`${start.lng},${start.lat}`);
			if (userPosStatic) parts.push(`${userPosStatic.lng},${userPosStatic.lat}`);
			for (const p of orderedPois) parts.push(`${p.lng},${p.lat}`);
			const coords = parts.join(';');
			const url = `https://routing.openstreetmap.de/routed-foot/route/v1/foot/${coords}?overview=full&geometries=geojson&steps=false&annotations=false&alternatives=false`;
			const res = await fetch(url);
			if (!res.ok) throw new Error(`OSRM error ${res.status}`);
			const data = await res.json();
			if (data.code !== 'Ok' || !data.routes || !data.routes[0]) throw new Error('Itinéraire introuvable');
			const line = data.routes[0].geometry;
			const fc = { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: line }] };
			setRouteGeoJSON(fc);
			setConnectorsGeoJSON(buildConnectors(line, orderedPois));
			setUserObject(prev => {
				if (!prev) return prev;
				const next = new User({
					id: prev.id,
					name: prev.name,
					profileImageUrl: prev.profileImageUrl,
					currentLocation: prev.currentLocation,
					prevZone: prev.prevZone,
					currentZone: prev.currentZone,
					currentTraject: new Traject(data),
					prevTraject: prev.currentTraject ?? prev.prevTraject ?? null,
					startPoint: prev.startPoint ?? null,
				});
				next.speed = prev.speed;
				next.avgSpeed = prev.avgSpeed;
				next.speedHistory = [...prev.speedHistory];
				return next;
			});
			try { startRouteAnimation(line.coordinates as number[][], setRouteAnimatedGeoJSON, routeAnimFrameRef); } catch {}
		} catch {
			setRouteGeoJSON(null);
			setConnectorsGeoJSON(null);
			setRouteAnimatedGeoJSON(null);
		}
	}, [orderedPois, startFromUser, startVisitedPoint, userObject]);
	recalculateTrajectRef.current = recalculateTraject;

	// Gestion du retrait/rajout de POI
	const handleRemovePOI = React.useCallback(async (poiId: string) => {
		try {
			await removePOI({ routeId: id, poiId }).unwrap();
			// Le recalcul se fera automatiquement via le useEffect qui surveille removedPoiIds
		} catch (error: any) {
			console.error('Erreur lors du retrait du POI:', error);
		}
	}, [id, removePOI]);

	const handleAddPOI = React.useCallback(async (poiId: string) => {
		try {
			await addPOI({ routeId: id, poiId }).unwrap();
			// Le recalcul se fera automatiquement via le useEffect qui surveille removedPoiIds
		} catch (error: any) {
			console.error('Erreur lors du rajout du POI:', error);
		}
	}, [id, addPOI]);

	// startRouteAnimation, buildConnectors, computePassedSegment importés depuis utils

	// Calculer la route OSRM: start -> user -> orderedPois (initial)
	useEffect(() => {
		const start = startFromUser || startVisitedPoint;
		const userPosStatic = initialUserRef.current; // position utilisateur initiale uniquement
		if (!orderedPois.length) return;
		if (osrmRequestedRef.current) return; // n'appeler OSRM qu'une seule fois pour l'initial
		(async () => {
				try {
					const parts: string[] = [];
				if (start) parts.push(`${start.lng},${start.lat}`);
				if (userPosStatic) parts.push(`${userPosStatic.lng},${userPosStatic.lat}`);
					for (const p of orderedPois) parts.push(`${p.lng},${p.lat}`);
					const coords = parts.join(';');
					const url = `https://routing.openstreetmap.de/routed-foot/route/v1/foot/${coords}?overview=full&geometries=geojson&steps=false&annotations=false&alternatives=false`;
					const res = await fetch(url);
					if (!res.ok) throw new Error(`OSRM error ${res.status}`);
					const data = await res.json();
					if (data.code !== 'Ok' || !data.routes || !data.routes[0]) throw new Error('Itinéraire introuvable');
					const line = data.routes[0].geometry; // LineString
					const fc = { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: line }] };
					setRouteGeoJSON(fc);
					setConnectorsGeoJSON(buildConnectors(line, orderedPois));
					// Sauvegarder le traject optimisé dans l'utilisateur (currentTraject) et décaler l'ancien en prevTraject
					setUserObject(prev => {
						if (!prev) return prev;
						const next = new User({
							id: prev.id,
							name: prev.name,
							profileImageUrl: prev.profileImageUrl,
							currentLocation: prev.currentLocation,
							prevZone: prev.prevZone,
							currentZone: prev.currentZone,
							currentTraject: new Traject(data),
							prevTraject: prev.currentTraject ?? prev.prevTraject ?? null,
							startPoint: prev.startPoint ?? null,
						});
						next.speed = prev.speed;
						next.avgSpeed = prev.avgSpeed;
						next.speedHistory = [...prev.speedHistory];
						return next;
					});
					try { startRouteAnimation(line.coordinates as number[][], setRouteAnimatedGeoJSON, routeAnimFrameRef); } catch {}
				// Ne pas zoomer/adapter sur tout le trajet (on reste centré sur l'utilisateur)
				} catch {
					setRouteGeoJSON(null);
					setConnectorsGeoJSON(null);
					setRouteAnimatedGeoJSON(null);
				}
			osrmRequestedRef.current = true;
		})();
			return () => { if (routeAnimFrameRef.current) cancelAnimationFrame(routeAnimFrameRef.current); };
	}, [orderedPois, startVisitedPoint, startFromUser]);

	// Recalculer le traject quand les POIs retirés changent
	const removedPoiIdsString = useMemo(() => {
		return Array.from(removedPoiIds).sort().join(',');
	}, [removedPoiIds]);
	
	useEffect(() => {
		if (!osrmRequestedRef.current) return; // Attendre le calcul initial
		if (!recalculateTrajectRef.current) return;
		// Utiliser removedPoiIdsString pour déclencher le recalcul
		const timeoutId = setTimeout(() => {
			recalculateTrajectRef.current?.();
		}, 200); // Délai pour laisser le temps à la requête de se terminer et aux données de se mettre à jour
		return () => clearTimeout(timeoutId);
	}, [removedPoiIdsString]);

	// Mettre à jour le segment "passé" et le point projeté en temps réel sans nouvel appel OSRM
	useEffect(() => {
		try {
			if (!routeGeoJSON || !(startFromUser || startVisitedPoint) || !userObject?.currentLocation) {
				setPassedSegmentGeoJSON(null);
				setUserProjectedLngLat(null);
				return;
			}
			const line = (routeGeoJSON.features?.[0]?.geometry as any);
			if (!line || !line.coordinates) return;
			const s = startFromUser || startVisitedPoint;
			const seg = computePassedSegment(
				line,
				{ lng: userObject.currentLocation.longitude, lat: userObject.currentLocation.latitude },
				{ lng: s!.lng, lat: s!.lat }
			);
			setPassedSegmentGeoJSON(seg);
			// Calculer le point projeté de l'utilisateur sur la ligne (pour l'affichage, sans changer sa position réelle)
			try {
				const coords: number[][] = (line.coordinates || []) as number[][];
				const p: [number, number] = [userObject.currentLocation.longitude, userObject.currentLocation.latitude];
				let best: { pt: [number, number]; d2: number } | null = null;
				for (let i = 0; i < coords.length - 1; i++) {
					const a = coords[i];
					const b = coords[i + 1];
					const ax = a[0], ay = a[1];
					const bx = b[0], by = b[1];
					const abx = bx - ax, aby = by - ay;
					const apx = p[0] - ax, apy = p[1] - ay;
					const ab2 = abx * abx + aby * aby;
					const tRaw = ab2 === 0 ? 0 : (apx * abx + apy * aby) / ab2;
					const t = Math.max(0, Math.min(1, tRaw));
					const qx = ax + t * abx;
					const qy = ay + t * aby;
					const dx = p[0] - qx;
					const dy = p[1] - qy;
					const d2 = dx * dx + dy * dy;
					if (!best || d2 < best.d2) best = { pt: [qx, qy], d2 };
				}
				if (best) setUserProjectedLngLat({ lng: best.pt[0], lat: best.pt[1] });
			} catch {}
		} catch {
			setPassedSegmentGeoJSON(null);
			setUserProjectedLngLat(null);
		}
	}, [routeGeoJSON, startVisitedPoint, startFromUser, userObject?.currentLocation]);

	// Mettre à jour le segment "passé" et la projection pour le trajet APRÈS (recalculé)
	useEffect(() => {
		try {
			if (!afterRouteGeometry || !afterStartRef.current || !userObject?.currentLocation) {
				return;
			}
			const seg = computePassedSegment(
				afterRouteGeometry,
				{ lng: userObject.currentLocation.longitude, lat: userObject.currentLocation.latitude },
				{ lng: afterStartRef.current.lng, lat: afterStartRef.current.lat }
			);
			setPassedSegmentGeoJSON(seg);
			// Projection du user sur la partie "après"
			try {
				const coords: number[][] = (afterRouteGeometry.coordinates || []) as number[][];
				const p: [number, number] = [userObject.currentLocation.longitude, userObject.currentLocation.latitude];
				let best: { pt: [number, number]; d2: number } | null = null;
				for (let i = 0; i < coords.length - 1; i++) {
					const a = coords[i];
					const b = coords[i + 1];
					const ax = a[0], ay = a[1];
					const bx = b[0], by = b[1];
					const abx = bx - ax, aby = by - ay;
					const apx = p[0] - ax, apy = p[1] - ay;
					const ab2 = abx * abx + aby * aby;
					const tRaw = ab2 === 0 ? 0 : (apx * abx + apy * aby) / ab2;
					const t = Math.max(0, Math.min(1, tRaw));
					const qx = ax + t * abx;
					const qy = ay + t * aby;
					const dx = p[0] - qx;
					const dy = p[1] - qy;
					const d2 = dx * dx + dy * dy;
					if (!best || d2 < best.d2) best = { pt: [qx, qy], d2 };
				}
				if (best) setUserProjectedLngLat({ lng: best.pt[0], lat: best.pt[1] });
			} catch {}
		} catch {
			// ne rien casser si la partie "après" n'est pas prête
		}
	}, [afterRouteGeometry, userObject?.currentLocation]);

	// Synchroniser notifiedPoiIdsRef avec notifiedPoiIds
	useEffect(() => {
		notifiedPoiIdsRef.current = notifiedPoiIds;
	}, [notifiedPoiIds]);

	// Nettoyer les timers lors du démontage
	useEffect(() => {
		return () => {
			Object.values(poiVisitTimersRef.current).forEach(timer => {
				if (timer) clearInterval(timer);
			});
		};
	}, []);

	// Détecter les POIs dans la zone de l'utilisateur et afficher une notification
	useEffect(() => {
		if (!userObject?.currentZone?.center || !normalizedPois.length) return;

		const userCenter = userObject.currentZone.center;
		const userRadius = userObject.currentZone.radiusMeters || 100;
		const newNotifiedIds: string[] = [];

		normalizedPois.forEach((poi) => {
			// Ignorer les POIs retirés
			if (removedPoiIds.has(String(poi.id))) return;
			
			// Ignorer si déjà notifié (utiliser le ref pour éviter les dépendances)
			if (notifiedPoiIdsRef.current.has(String(poi.id))) return;

			// Calculer la distance entre le POI et le centre de la zone
			const distance = GeoUtils.distanceMeters(
				userCenter,
				new GeoPoint(poi.lat, poi.lng)
			);

			// Si le POI est dans la zone
			if (distance <= userRadius) {
				newNotifiedIds.push(String(poi.id));

				// Afficher la notification
				const poiDescription = (poi.raw?.frLocalization as any)?.description || 
					(poi.raw?.enLocalization as any)?.description || 
					(poi.raw?.arLocalization as any)?.description || 
					'Découvrez ce point d\'intérêt';

				toast.success(
					<div 
						className="flex items-start gap-3 cursor-pointer w-full"
						onClick={() => {
							setSelectedPoiId(poi.id);
							if (mapRef.current) {
								try {
									mapRef.current.flyTo({ center: [poi.lng, poi.lat], zoom: 16, speed: 1.2, curve: 1 });
								} catch {}
							}
						}}
					>
						{poi.img && (
							<img 
								src={poi.img} 
								alt={poi.label} 
								className="w-16 h-16 rounded-lg object-cover border border-border flex-shrink-0"
							/>
						)}
						<div className="flex-1 min-w-0">
							<div className="font-semibold text-sm mb-1">{poi.label}</div>
							<div className="text-xs text-muted-foreground line-clamp-2">
								{poiDescription}
							</div>
							<div className="text-[10px] text-muted-foreground mt-1">
								Cliquez pour voir les détails
							</div>
						</div>
					</div>,
					{
						duration: 8000,
						position: 'top-center',
					}
				);
			}
		});

		// Mettre à jour les IDs notifiés en une seule fois
		if (newNotifiedIds.length > 0) {
			setNotifiedPoiIds(prev => {
				const updated = new Set(prev);
				newNotifiedIds.forEach(id => updated.add(id));
				return updated;
			});
		}
	}, [userObject?.currentZone?.center?.latitude, userObject?.currentZone?.center?.longitude, userObject?.currentZone?.radiusMeters, normalizedPois, removedPoiIds]);

	// Détecter la proximité des POIs (10m) et démarrer le timer de visite (30 secondes)
	useEffect(() => {
		if (!userObject?.currentLocation || !normalizedPois.length) return;

		const userLocation = userObject.currentLocation;
		const PROXIMITY_DISTANCE = 15; // 10 mètres
		const VISIT_DURATION = 30; // 30 secondes
		
		// Créer une copie locale de visitedPoiIds pour éviter les problèmes de closure
		const currentVisitedPoiIds = new Set(visitedPoiIds);

		normalizedPois.forEach((poi) => {
			const poiId = String(poi.id);
			
			// Ignorer les POIs retirés ou déjà visités
			if (removedPoiIds.has(poiId) || currentVisitedPoiIds.has(poiId)) {
				// Arrêter le timer si l'utilisateur s'éloigne ou si le POI est déjà visité
				if (poiVisitTimersRef.current[poiId]) {
					clearInterval(poiVisitTimersRef.current[poiId]);
					delete poiVisitTimersRef.current[poiId];
					setPoiVisitTimers(prev => {
						const updated = { ...prev };
						delete updated[poiId];
						return updated;
					});
					if (visitingPoiId === poiId) {
						setVisitingPoiId(null);
					}
				}
				return;
			}

			// Calculer la distance entre l'utilisateur et le POI
			const distance = GeoUtils.distanceMeters(
				userLocation,
				new GeoPoint(poi.lat, poi.lng)
			);

			// Si l'utilisateur est à moins de 10m
			if (distance <= PROXIMITY_DISTANCE) {
				// Si le timer n'existe pas encore, le démarrer
				if (!poiVisitTimersRef.current[poiId]) {
					// Vérifier une dernière fois que le POI n'est pas déjà visité avant de démarrer le timer
					if (currentVisitedPoiIds.has(poiId)) {
						return;
					}

					const startTime = Date.now();
					setVisitingPoiId(poiId);
					setPoiVisitTimers(prev => ({
						...prev,
						[poiId]: { startTime, remainingSeconds: VISIT_DURATION }
					}));

					// Démarrer le timer
					const timer = setInterval(() => {
						setPoiVisitTimers(prev => {
							const timerData = prev[poiId];
							if (!timerData) return prev;
							
							// Vérifier à nouveau que le POI n'est pas déjà visité (utiliser le ref pour avoir la valeur à jour)
							const routeDataCheck = routeResp as any;
							const visitedTracesCheck = routeDataCheck?.data?.visitedTraces || [];
							const currentVisitedPoiIdsCheck = new Set(
								visitedTracesCheck.map((t: any) => String((t.poiId ?? t.idPoi ?? '') || '')).filter(Boolean)
							);
							if (currentVisitedPoiIdsCheck.has(poiId)) {
								clearInterval(poiVisitTimersRef.current[poiId]);
								delete poiVisitTimersRef.current[poiId];
								setVisitingPoiId(prevId => prevId === poiId ? null : prevId);
								return { ...prev };
							}
							
							const elapsed = Math.floor((Date.now() - timerData.startTime) / 1000);
							const remaining = Math.max(0, VISIT_DURATION - elapsed);

							if (remaining === 0) {
								// Timer terminé - marquer le POI comme visité
								clearInterval(poiVisitTimersRef.current[poiId]);
								delete poiVisitTimersRef.current[poiId];
								
								// Vérifier une dernière fois avant d'envoyer pour éviter les doublons (utiliser le ref pour avoir la valeur à jour)
								const routeDataFinal = routeResp as any;
								const visitedTracesFinal = routeDataFinal?.data?.visitedTraces || [];
								const currentVisitedPoiIdsFinal = new Set(
									visitedTracesFinal.map((t: any) => String((t.poiId ?? t.idPoi ?? '') || '')).filter(Boolean)
								);
								if (currentVisitedPoiIdsFinal.has(poiId)) {
									setVisitingPoiId(prevId => prevId === poiId ? null : prevId);
									return { ...prev };
								}
								
								// Envoyer la trace visitée avec le POI
								addVisitedTrace({
									routeId: id,
									longitude: userLocation.longitude,
									latitude: userLocation.latitude,
									pois: [poiId]
								}).unwrap().then((response: any) => {
									// Animation de succès
									setVisitingPoiId(null);
									
									// Vérifier si le circuit est complété
									if (response?.data?.isRouteCompleted && response?.data?.pointsAwarded) {
										setCompletionPoints({
											totalPoints: response.data.pointsAwarded.totalPoints || 0,
											pointsAwarded: response.data.pointsAwarded.pointsAwarded || []
										});
										setCompletionModalOpen(true);
									} else {
										toast.success(`✓ ${poi.label} marqué comme visité !`, {
											duration: 3000,
											position: 'top-center',
										});
									}
									
									// Recalculer le trajectoire après la visite
									setTimeout(() => {
										if (recalculateTrajectRef.current) {
											recalculateTrajectRef.current();
										}
									}, 500);
								}).catch((error: any) => {
									console.error('Erreur lors de la visite du POI:', error);
									setVisitingPoiId(null);
								});

								return { ...prev };
							}

							return {
								...prev,
								[poiId]: { ...timerData, remainingSeconds: remaining }
							};
						});
					}, 100); // Mise à jour toutes les 100ms pour un affichage fluide

					poiVisitTimersRef.current[poiId] = timer;
				}
			} else {
				// L'utilisateur s'est éloigné - arrêter le timer
				if (poiVisitTimersRef.current[poiId]) {
					clearInterval(poiVisitTimersRef.current[poiId]);
					delete poiVisitTimersRef.current[poiId];
					setPoiVisitTimers(prev => {
						const updated = { ...prev };
						delete updated[poiId];
						return updated;
					});
					if (visitingPoiId === poiId) {
						setVisitingPoiId(null);
					}
				}
			}
		});
	}, [userObject?.currentLocation?.latitude, userObject?.currentLocation?.longitude, normalizedPois, removedPoiIds, visitedPoiIds, id, addVisitedTrace, visitingPoiId]);

    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////
	// Contrôles clavier pour simuler le GPS (flèches/WASD)
	useEffect(() => {
		const handler = async (e: KeyboardEvent) => {
			if (!userObject) return;
			const key = e.key.toLowerCase();
			const isArrow = key.startsWith('arrow');
			const isWASD = ['w', 'a', 's', 'd'].includes(key);
			if (!isArrow && !isWASD) return;
			e.preventDefault();
			// pas en mètres (Shift pour accélérer)
			const baseStep = 1.1; // 5 m
			const step = e.shiftKey ? baseStep * 5 : baseStep;
			const cur = userObject.currentLocation ?? userObject.prevZone?.center;
			if (!cur) return;
			const lat = cur.latitude;
			const lon = cur.longitude;
			// conversion mètres -> degrés
			const dLatDeg = (meters: number) => meters / 111111; // approx
			const dLonDeg = (meters: number, atLat: number) => meters / (111111 * Math.cos(atLat * Math.PI / 180));
			let north = 0, east = 0;
			if (key === 'arrowup' || key === 'w') north = step;
			if (key === 'arrowdown' || key === 's') north = -step;
			if (key === 'arrowright' || key === 'd') east = step;
			if (key === 'arrowleft' || key === 'a') east = -step;
			const newLat = Math.max(-90, Math.min(90, lat + dLatDeg(north)));
			const newLonRaw = lon + dLonDeg(east, lat);
			let newLon = newLonRaw;
			if (newLon > 180) newLon -= 360;
			if (newLon < -180) newLon += 360;
			const newPoint = new GeoPoint(newLat, newLon, Date.now(), cur.accuracy);
			// calculer la vitesse (m/s)
			let newSpeed = 0;
			try {
				const lastTs = userObject.currentLocation?.timestamp ?? Date.now();
				const dt = Math.max(0.001, (newPoint.timestamp - lastTs) / 1000);
				const distM = GeoUtils.distanceMeters(new GeoPoint(lat, lon, lastTs), newPoint);
				newSpeed = distM / dt;
			} catch {}
			setSpeedMs(newSpeed);
			const speedKmhEff = newSpeed * 3.6;
			const newRadius = getZoneRadiusForSpeed(speedKmhEff);
			const newZoom = getZoomForSpeed(speedKmhEff);
			const newCurrentZone = userObject.currentZone
				? new Zone({ id: userObject.currentZone.id, center: newPoint, radiusMeters: newRadius, type: 'realtime', name: userObject.currentZone.name })
				: new Zone({ id: `realtime-${Date.now()}`, center: newPoint, radiusMeters: newRadius, type: 'realtime', name: 'Realtime Zone' });
			// Sauvegarder l'ancien centre de prevZone pour détecter le changement
			const oldPrevZoneCenter = userObject.prevZone?.center 
				? { lat: userObject.prevZone.center.latitude, lng: userObject.prevZone.center.longitude }
				: null;
			// reset vitesse à 0 si aucun mouvement après 1.5s
			if (speedResetTimerRef.current) window.clearTimeout(speedResetTimerRef.current);
			speedResetTimerRef.current = window.setTimeout(() => {
				setSpeedMs(0);
				setUserObject(prev => {
					if (!prev) return prev;
					const kmh = 0;
					const radius = getZoneRadiusForSpeed(kmh);
					const updatedCurrentZone = prev.currentZone
						? new Zone({ id: prev.currentZone.id, center: prev.currentZone.center, radiusMeters: radius, type: 'realtime', name: prev.currentZone.name })
						: null;
					const updatedPrevZone = prev.prevZone
						? new Zone({ id: prev.prevZone.id, center: prev.prevZone.center, radiusMeters: radius, type: 'fixed', name: prev.prevZone.name })
						: null;
					const next = new User({
						id: prev.id,
						name: prev.name,
						profileImageUrl: prev.profileImageUrl,
						currentLocation: prev.currentLocation,
						prevZone: updatedPrevZone,
						currentZone: updatedCurrentZone,
						startPoint: prev.startPoint ?? null,
					});
					next.speed = 0;
					return next;
				});
				try {
					const kmh = 0;
					const zoom = getZoomForSpeed(kmh);
					const loc = userObject?.currentLocation;
					if (loc) mapRef.current?.flyTo({ center: [loc.longitude, loc.latitude], zoom, speed: 1.0, curve: 1 });
				} catch {}
			}, 1500);
			
			// Créer un User temporaire pour vérifier si le centre de prevZone va changer
			const tempUser = new User({
				id: userObject.id,
				name: userObject.name,
				profileImageUrl: userObject.profileImageUrl,
				currentLocation: newPoint,
				prevZone: userObject.prevZone ?? null,
				currentZone: newCurrentZone,
				currentTraject: userObject.currentTraject ?? null,
				prevTraject: userObject.prevTraject ?? null,
				startPoint: userObject.startPoint ?? null,
			});
			tempUser.speed = newSpeed;
			tempUser.avgSpeed = userObject.avgSpeed;
			tempUser.speedHistory = [...userObject.speedHistory];
			tempUser.lastLocationTimestamp = newPoint.timestamp;
			const newPrevRadius = newRadius;
			tempUser.ensurePrevZoneContains(newPoint, newPrevRadius);
			if (tempUser.prevZone) tempUser.prevZone.radiusMeters = newPrevRadius;
			
			// Détecter si le centre de prevZone a changé
			const prevZoneCenterChanged = (() => {
				if (!oldPrevZoneCenter) {
					// Si on n'avait pas de prevZone avant, on considère qu'il y a changement si une prevZone existe maintenant
					return tempUser.prevZone !== null;
				}
				if (!tempUser.prevZone) return false;
				const newCenter = tempUser.prevZone.center;
				const centerChanged = 
					Math.abs(oldPrevZoneCenter.lat - newCenter.latitude) > 0.000001 ||
					Math.abs(oldPrevZoneCenter.lng - newCenter.longitude) > 0.000001;
				return centerChanged;
			})();
			
			// Mettre à jour l'état avec le User temporaire
			setUserObject(tempUser);
			
			// Si le centre de prevZone a changé, envoyer la trace et recalculer le traject
			if (prevZoneCenterChanged) {
				// Mettre à jour immédiatement le segment "passé" en gris sur le trajet restant AVANT le fetch
				try {
					if (routeAfterGeoJSON && afterStartRef.current) {
						const line = (routeAfterGeoJSON.features?.[0]?.geometry as any);
						if (line?.coordinates) {
							const seg = computePassedSegment(
								line,
								{ lng: newLon, lat: newLat },
								{ lng: afterStartRef.current.lng, lat: afterStartRef.current.lat }
							);
							setPassedSegmentGeoJSON(seg);
						}
					} else if (routeGeoJSON && (startFromUser || startVisitedPoint)) {
						const base = (routeGeoJSON.features?.[0]?.geometry as any);
						if (base?.coordinates) {
							const s = startFromUser || startVisitedPoint;
							const seg = computePassedSegment(
								base,
								{ lng: newLon, lat: newLat },
								{ lng: s!.lng, lat: s!.lat }
							);
							setPassedSegmentGeoJSON(seg);
						}
					}
				} catch {}
				try {
					const resp = await addVisitedTrace({ routeId: id, longitude: newLon, latitude: newLat, pois: [] }).unwrap();
					
					// Vérifier si le circuit est complété
					if (resp?.data?.isRouteCompleted && resp?.data?.pointsAwarded) {
						setCompletionPoints({
							totalPoints: resp.data.pointsAwarded.totalPoints || 0,
							pointsAwarded: resp.data.pointsAwarded.pointsAwarded || []
						});
						setCompletionModalOpen(true);
					}
					
					const visited = Array.isArray(resp?.data?.visitedTraces) ? resp.data.visitedTraces : [];
					// Vérifier distance au trajet actuel vs rayon de la zone temps réel
					let mustRecalc = true;
					try {
						const coords: number[][] | undefined = tempUser?.currentTraject?.routes?.[0]?.geometry?.coordinates as any;
						const radiusMeters = tempUser?.currentZone?.radiusMeters ?? 100;
						if (Array.isArray(coords) && coords.length > 1 && tempUser?.currentLocation) {
							const p: [number, number] = [newLon, newLat];
							let bestPt: [number, number] | null = null;
							let bestD2 = Infinity;
							for (let i = 0; i < coords.length - 1; i++) {
								const a = coords[i];
								const b = coords[i + 1];
								const ax = a[0], ay = a[1];
								const bx = b[0], by = b[1];
								const abx = bx - ax, aby = by - ay;
								const apx = p[0] - ax, apy = p[1] - ay;
								const ab2 = abx * abx + aby * aby;
								const tRaw = ab2 === 0 ? 0 : (apx * abx + apy * aby) / ab2;
								const t = Math.max(0, Math.min(1, tRaw));
								const qx = ax + t * abx;
								const qy = ay + t * aby;
								const dx = p[0] - qx;
								const dy = p[1] - qy;
								const d2 = dx * dx + dy * dy;
								if (d2 < bestD2) { bestD2 = d2; bestPt = [qx, qy]; }
							}
							if (bestPt) {
								const distMeters = GeoUtils.distanceMeters(new GeoPoint(p[1], p[0]), new GeoPoint(bestPt[1], bestPt[0]));
								mustRecalc = distMeters > radiusMeters;
							}
						}
					} catch {}
					if (mustRecalc) {
						try {
							const start = (tempUser?.startPoint ? { lng: tempUser.startPoint.longitude, lat: tempUser.startPoint.latitude } : (startVisitedPoint ? { lng: startVisitedPoint.lng, lat: startVisitedPoint.lat } : null));
							// Trajet A (avant) : start -> visitedTraces (ordre chrono) -> user
							const visitedSorted = [...visited].sort((a: any, b: any) => new Date(a.createdAt || a.created_at || 0).getTime() - new Date(b.createdAt || b.created_at || 0).getTime());
							const beforeParts: string[] = [];
							let computeBefore = true;
							try {
								const radiusMeters = tempUser?.currentZone?.radiusMeters ?? 100;
								if (start) {
									const distToStart = GeoUtils.distanceMeters(new GeoPoint(newLat, newLon), new GeoPoint(start.lat, start.lng));
									if (distToStart <= radiusMeters) computeBefore = false;
								}
							} catch {}
							if (computeBefore && start) beforeParts.push(`${start.lng},${start.lat}`);
							if (computeBefore) {
								for (const t of visitedSorted) {
									const lngNum = Number(t.longitude);
									const latNum = Number(t.latitude);
									if (Number.isFinite(lngNum) && Number.isFinite(latNum)) beforeParts.push(`${lngNum},${latNum}`);
								}
								beforeParts.push(`${newLon},${newLat}`);
							}
							let beforeLine: any = null;
							if (computeBefore && beforeParts.length >= 2) {
								const urlBefore = `https://routing.openstreetmap.de/routed-foot/route/v1/foot/${beforeParts.join(';')}?overview=full&geometries=geojson&steps=false&annotations=false&alternatives=false`;
								const resBefore = await fetch(urlBefore);
								if (!resBefore.ok) throw new Error(`OSRM error ${resBefore.status}`);
								const dataBefore = await resBefore.json();
								if (dataBefore.code === 'Ok' && dataBefore.routes && dataBefore.routes[0]) beforeLine = dataBefore.routes[0].geometry;
							}
							// Trajet B (après) : user -> POIs restants (nearest neighbor)
							const visitedPoiIds = new Set(
								visited.map((t: any) => String((t.poiId ?? t.idPoi ?? '') || '')).filter(Boolean)
							);
							const remainingPois = orderedPois.filter(p => !visitedPoiIds.has(String(p.raw?.id ?? p.id)));
							const nnOrder = (() => {
								if (!remainingPois.length) return [] as typeof remainingPois;
								const rem = [...remainingPois];
								const ordered: typeof remainingPois = [];
								let current = { lat: newLat, lng: newLon };
								const distNN = (a: {lat:number;lng:number}, b: {lat:number;lng:number}) => {
									const dlat = a.lat - b.lat; const dlng = a.lng - b.lng; return dlat*dlat + dlng*dlng;
								};
								while (rem.length) {
									let bestIdx = 0; let bestD = Infinity;
									for (let i = 0; i < rem.length; i++) {
										const d = distNN(current, { lat: rem[i].lat, lng: rem[i].lng });
										if (d < bestD) { bestD = d; bestIdx = i; }
									}
									const [n] = rem.splice(bestIdx, 1);
									ordered.push(n);
									current = { lat: n.lat, lng: n.lng };
								}
								return ordered;
							})();
							// Mémoriser l'ordre NN pour affichage des index
							const orderMap: Record<string, number> = {};
							nnOrder.forEach((p, i) => { orderMap[p.id] = i + 1; });
							setAfterPoiOrderMap(orderMap);
							let afterLine: any = null;
							if (nnOrder.length) {
								const afterParts: string[] = [];
								afterParts.push(`${newLon},${newLat}`);
								for (const p of nnOrder) afterParts.push(`${p.lng},${p.lat}`);
								const urlAfter = `https://routing.openstreetmap.de/routed-foot/route/v1/foot/${afterParts.join(';')}?overview=full&geometries=geojson&steps=false&annotations=false&alternatives=false`;
								const resAfter = await fetch(urlAfter);
								if (!resAfter.ok) throw new Error(`OSRM error ${resAfter.status}`);
								const dataAfter = await resAfter.json();
								if (dataAfter.code === 'Ok' && dataAfter.routes && dataAfter.routes[0]) afterLine = dataAfter.routes[0].geometry;
								// Mettre à jour currentTraject/prevTraject avec la partie “après”
								setUserObject(prev => {
									if (!prev) return prev;
									const next = new User({
										id: prev.id,
										name: prev.name,
										profileImageUrl: prev.profileImageUrl,
										currentLocation: prev.currentLocation,
										prevZone: prev.prevZone,
										currentZone: prev.currentZone,
										currentTraject: new Traject(dataAfter),
										prevTraject: prev.currentTraject ?? prev.prevTraject ?? null,
										startPoint: prev.startPoint ?? null,
									});
									next.speed = prev.speed;
									next.avgSpeed = prev.avgSpeed;
									next.speedHistory = [...prev.speedHistory];
									return next;
								});
								// Mémoriser pour le segment passé gris
								setAfterRouteGeometry(afterLine);
								afterStartRef.current = { lng: newLon, lat: newLat };
							}
							// Fusion visuelle des deux parties
							if (beforeLine) setRouteBeforeGeoJSON({ type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: beforeLine }] }); else setRouteBeforeGeoJSON(null);
							if (afterLine) setRouteAfterGeoJSON({ type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: afterLine }] }); else setRouteAfterGeoJSON(null);
							// Connecteurs sur la partie “après” uniquement
							if (afterLine) setConnectorsGeoJSON(buildConnectors(afterLine, nnOrder)); else setConnectorsGeoJSON(null);
							try { if (afterLine) startRouteAnimation(afterLine.coordinates as number[][], setRouteAnimatedGeoJSON, routeAnimFrameRef); } catch {}
							// Ne pas utiliser la source combinée ici
							setRouteGeoJSON(null);
						} catch {}
					}
				} catch {}
			}
			try {
				mapRef.current?.flyTo({ center: [newLon, newLat], zoom: newZoom, speed: 1.2, curve: 1 });
			} catch {}
		};
		window.addEventListener('keydown', handler);
		return () => {
			window.removeEventListener('keydown', handler as any);
			if (speedResetTimerRef.current) window.clearTimeout(speedResetTimerRef.current);
		};
	}, [userObject, orderedPois, startVisitedPoint]);
    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////


	if (loading || !userObject?.currentLocation) {
		return (
			<div className="w-full h-screen flex items-center justify-center text-sm text-muted-foreground">
				Chargement de votre position...
			</div>
		);
	}

	return (
		<div className="flex flex-col md:flex-row w-full h-screen overflow-hidden border border-border bg-background">
			{/* Sidebar (liste ou détail POI) */}
			<div className="order-2 md:order-none w-full md:w-[380px] h-[45vh] md:h-full overflow-y-auto border-t md:border-t-0 md:border-r border-border bg-card">
				<div className="p-4 border-b border-border sticky top-0 bg-card z-10">
					<h4 className="font-semibold">POIs du circuit</h4>
					<p className="text-xs text-muted-foreground mt-1">
						{normalizedPois.length} POI{normalizedPois.length > 1 ? 's' : ''} au total
						{removedPoiIds.size > 0 && (
							<span className="ml-2 text-gray-500">
								({removedPoiIds.size} retiré{removedPoiIds.size > 1 ? 's' : ''})
							</span>
						)}
					</p>
				</div>

				{!selectedPoiId ? (
					<>
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
								const isVisited = visitedPoiIds.has(String(poi.id));
								const isRemoved = removedPoiIds.has(String(poi.id));
								const displayOrder = afterPoiOrderMap[poi.id] ?? (index + 1);
								return (
									<div 
										key={poi.id} 
										className={cn(
											"flex items-center gap-3 p-3 border-b border-border bg-card transition-colors",
											isVisited && !isRemoved && "bg-green-50 border-green-200",
											isRemoved && "bg-gray-50 border-gray-200 opacity-60",
											!isRemoved && "cursor-pointer hover:bg-muted"
										)}
										onClick={() => !isRemoved && handleSelectPoi(poi)}
									>
										<div className="relative flex-shrink-0">
											<div className={cn(
												"w-12 h-12 rounded-lg overflow-hidden border border-border shadow-sm bg-muted",
												isVisited && !isRemoved && "border-green-500",
												isRemoved && "border-gray-400 grayscale"
											)}>
												{poi.img ? (
													<img src={poi.img} alt={poi.label} className={cn("w-full h-full object-cover", isRemoved && "opacity-50")} />
												) : (
													<div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">POI</div>
												)}
											</div>
											{isVisited && !isRemoved && (
												<div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow">
													✓
												</div>
											)}
											{isRemoved && (
												<div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
													<X className="w-6 h-6 text-gray-600" />
												</div>
											)}
										</div>
										<div className="flex flex-col min-w-0 flex-1">
											<div className="flex items-center gap-2">
												<span className={cn("font-semibold text-sm truncate", isRemoved && "line-through text-gray-500")}>{poi.label}</span>
												<span className={cn(
													"text-[11px] px-1.5 py-0.5 rounded-full ml-auto",
													isVisited && !isRemoved ? "bg-green-100 text-green-700" : 
													isRemoved ? "bg-gray-200 text-gray-600" : 
													"bg-primary/10 text-primary"
												)}>
													#{displayOrder}
												</span>
											</div>
											<span className={cn("text-xs text-muted-foreground", isRemoved && "text-gray-400")}>{poi.lat.toFixed(4)}, {poi.lng.toFixed(4)}</span>
											{isVisited && !isRemoved && (
												<span className="text-[10px] text-green-600 mt-1">✓ Visité</span>
											)}
											{isRemoved && (
												<span className="text-[10px] text-gray-500 mt-1">Retiré</span>
											)}
										</div>
										{/* Bouton pour retirer/rajouter */}
										<div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
											{isRemoved ? (
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
													onClick={() => handleAddPOI(poi.id)}
													title="Rajouter au circuit"
												>
													<Plus className="w-4 h-4" />
												</Button>
											) : (
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
													onClick={() => handleRemovePOI(poi.id)}
													title="Retirer du circuit"
												>
													<X className="w-4 h-4" />
												</Button>
											)}
										</div>
									</div>
								);
							})
						)}
					</>
				) : (
					<div className="mt-4 p-4">
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
								const locKey = 'fr' as 'fr' | 'en' | 'ar';
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

			{/* Carte */}
			<div className="order-1 md:order-none relative md:flex-1 h-[55vh] md:h-full">
				<Map
				ref={mapRef}
				initialViewState={{ latitude: center.latitude, longitude: center.longitude, zoom: 16 }}
				mapStyle={MAP_STYLE}
				mapLib={maplibregl}
				style={{ width: '100%', height: '100%' }}
			>
				{/* Itinéraire principal (avec bordure + ligne) */}
				{routeGeoJSON && !hasRouteParts && (
					<>
						<Source id="route-border" type="geojson" data={routeAnimatedGeoJSON || routeGeoJSON}>
							<Layer id="route-border-line" type="line" paint={{ 'line-color': '#000000', 'line-width': 8, 'line-opacity': 0.8 }} />
						</Source>
						<Source id="route" type="geojson" data={routeAnimatedGeoJSON || routeGeoJSON}>
							<Layer id="route-line" type="line" paint={{ 'line-color': '#10b981', 'line-width': 4, 'line-opacity': 0.9 }} layout={{ 'line-cap': 'round', 'line-join': 'round' }} />
						</Source>
					</>
				)}
				{hasRouteParts && (
					<>
						{routeBeforeGeoJSON && (
							<>
								<Source id="route-before-border" type="geojson" data={routeBeforeGeoJSON}>
									<Layer id="route-before-border-line" type="line" paint={{ 'line-color': '#000000', 'line-width': 8, 'line-opacity': 0.8 }} layout={{ 'line-cap': 'round', 'line-join': 'round' }} />
								</Source>
								<Source id="route-before" type="geojson" data={routeBeforeGeoJSON}>
									<Layer id="route-before-line" type="line" paint={{ 'line-color': '#9ca3af', 'line-width': 4, 'line-opacity': 0.9 }} layout={{ 'line-cap': 'round', 'line-join': 'round' }} />
								</Source>
							</>
						)}
						{routeAfterGeoJSON && (
							<>
								<Source id="route-after-border" type="geojson" data={routeAnimatedGeoJSON || routeAfterGeoJSON}>
									<Layer id="route-after-border-line" type="line" paint={{ 'line-color': '#000000', 'line-width': 8, 'line-opacity': 0.8 }} layout={{ 'line-cap': 'round', 'line-join': 'round' }} />
								</Source>
								<Source id="route-after" type="geojson" data={routeAnimatedGeoJSON || routeAfterGeoJSON}>
									<Layer id="route-after-line" type="line" paint={{ 'line-color': '#10b981', 'line-width': 4, 'line-opacity': 0.9 }} layout={{ 'line-cap': 'round', 'line-join': 'round' }} />
								</Source>
							</>
						)}
					</>
				)}
				{passedSegmentGeoJSON && (
					<Source id="route-passed" type="geojson" data={passedSegmentGeoJSON}>
						<Layer id="route-passed-line" type="line" paint={{ 'line-color': '#9ca3af', 'line-width': 4, 'line-opacity': 0.9 }} layout={{ 'line-cap': 'round', 'line-join': 'round' }} />
					</Source>
				)}
				{connectorsGeoJSON && connectorsGeoJSON.features?.length > 0 && (
					<Source id="poi-connectors" type="geojson" data={connectorsGeoJSON}>
						<Layer id="poi-connector" type="line" paint={{ 'line-color': '#3593eb', 'line-width': 2, 'line-opacity': 0.6, 'line-dasharray': [2, 2] }} />
					</Source>
				)}
				{/* Zone précédente (verte) */}
				{/* Zone fixe précédente (bleue) */}
				{prevZoneGeoJSON && (
					<Source id="prev-zone" type="geojson" data={prevZoneGeoJSON}>
						<Layer id="prev-zone-fill" type="fill" paint={{ 'fill-color': '#3b82f6', 'fill-opacity': 0.18 }} />
						<Layer id="prev-zone-outline" type="line" paint={{ 'line-color': '#1d4ed8', 'line-width': 2, 'line-opacity': 0.9 }} />
					</Source>
				)}
				{/* Zone realtime (verte) */}
				{currentZoneGeoJSON && (
					<Source id="current-zone" type="geojson" data={currentZoneGeoJSON}>
						<Layer id="current-zone-fill" type="fill" paint={{ 'fill-color': '#22c55e', 'fill-opacity': 0.18 }} />
						<Layer id="current-zone-outline" type="line" paint={{ 'line-color': '#16a34a', 'line-width': 2, 'line-opacity': 0.9 }} />
					</Source>
				)}
				{/* Scanner rotatif centré sur la zone realtime */}
				{userObject?.currentZone?.center && (
					<Marker longitude={userObject.currentZone.center.longitude} latitude={userObject.currentZone.center.latitude} anchor="center">
						<img
							src="/images/scanaire.png"
							alt="Scanner"
							className="pointer-events-none select-none animate-spin"
							style={{ width: '180px', height: '180px', animationDuration: '6s', opacity: 0.8 }}
						/>
					</Marker>
				)}
				{/* Marqueur du point de départ (visitedTrace[0] / startPoint) */}
				{startFromUser && (
					<Marker longitude={startFromUser.lng} latitude={startFromUser.lat} anchor="bottom">
						<div className="relative">
							<div className="w-4 h-4 rounded-full bg-white border-2 border-emerald-600 shadow" />
							<div className="absolute -top-3 -right-3 bg-white text-green-600 rounded-full p-1 shadow">
								<FlagIcon className="w-3 h-3" />
							</div>
						</div>
					</Marker>
				)}

				{/* Marqueur de l'utilisateur (position réelle) */}
				{userObject?.currentLocation && (
					<Marker longitude={userObject.currentLocation.longitude} latitude={userObject.currentLocation.latitude} anchor="center">
						<div className="w-5 h-5 rounded-full bg-emerald-600 border-2 border-white shadow" title={userObject.name || 'User'} />
					</Marker>
				)}

				{/* Marqueur projeté sur l'itinéraire (entre gris et vert) */}
				{userProjectedLngLat && (
					<Marker longitude={userProjectedLngLat.lng} latitude={userProjectedLngLat.lat} anchor="center">
						<div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow" title="Projection sur l'itinéraire" />
					</Marker>
				)}

				{/* Marqueurs POIs avec index */}
				{normalizedPois.map((poi, index) => {
					const poiId = String(poi.id);
					const isVisited = visitedPoiIds.has(poiId);
					const isRemoved = removedPoiIds.has(poiId);
					const isVisiting = visitingPoiId === poiId;
					const timerData = poiVisitTimers[poiId];
					const remainingSeconds = timerData?.remainingSeconds ?? 0;
					const progress = timerData ? ((30 - remainingSeconds) / 30) * 100 : 0;

					// Ne pas afficher les POIs retirés
					if (isRemoved) return null;

					return (
						<Marker key={poi.id} longitude={poi.lng} latitude={poi.lat} anchor="bottom">
							<div className="relative cursor-pointer">
								<div className={cn(
									"w-10 h-10 border-2 bg-white rounded-full overflow-hidden shadow transition-all duration-300",
									isVisited && "border-gray-400 grayscale opacity-60",
									isVisiting && "border-blue-500 ring-2 ring-blue-500 ring-offset-2",
									!isVisited && !isVisiting && "border-emerald-600"
								)}>
									{poi.img ? (
										<img 
											src={poi.img} 
											alt={poi.label} 
											className={cn(
												"w-full h-full object-cover",
												isVisited && "grayscale opacity-60"
											)} 
										/>
									) : (
										<div className={cn(
											"w-full h-full flex items-center justify-center text-[10px] text-muted-foreground",
											isVisited && "opacity-60"
										)}>POI</div>
									)}
									{/* Barre de progression circulaire pour le timer */}
									{isVisiting && (
										<div className="absolute inset-0 rounded-full" style={{
											background: `conic-gradient(from 0deg, #3b82f6 ${progress}%, transparent ${progress}%)`
										}} />
									)}
								</div>
								<div className={cn(
									"absolute -bottom-1 left-1/2 -translate-x-1/2 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow",
									isVisited && "bg-gray-500",
									isVisiting && "bg-blue-500",
									!isVisited && !isVisiting && "bg-emerald-600"
								)}>
									{isVisited ? '✓' : (afterPoiOrderMap[poi.id] ?? (index + 1))}
								</div>
								<div className={cn(
									"absolute -top-1 -right-1 rounded-full p-1 shadow",
									isVisited ? "bg-gray-200 text-gray-500" : "bg-white text-green-600"
								)}>
									<MapPinIcon className="w-3 h-3" />
								</div>
								{/* Chronomètre de visite */}
								{isVisiting && timerData && (
									<div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-semibold shadow-lg whitespace-nowrap z-10">
										<div className="flex items-center gap-1">
											<div className="w-2 h-2 bg-white rounded-full" />
											{remainingSeconds}s
										</div>
										<div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-600 rotate-45" />
									</div>
								)}
							</div>
						</Marker>
					);
				})}
			</Map>
			</div>

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

			{/* Modal de complétion du circuit */}
			{completionPoints && (
				<CircuitCompletionModal
					open={completionModalOpen}
					onOpenChange={setCompletionModalOpen}
					totalPoints={completionPoints.totalPoints}
					pointsAwarded={completionPoints.pointsAwarded}
				/>
			)}
		</div>
	);
}