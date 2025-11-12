"use client";

import React, { use, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import Map, { Marker, Source, Layer } from 'react-map-gl/maplibre';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useGetRouteByIdQuery, useAddVisitedTraceMutation } from '@/services/api/RouteApi';
import { MapPinIcon, FlagIcon } from 'lucide-react';
import { GeoPoint, Zone, User, GeoUtils, Traject } from '@/lib/geo';
import { zoneToPolygon, computePassedSegment, buildConnectors, startRouteAnimation, getZoneRadiusForSpeed, getZoomForSpeed } from '@/lib/mapRouteUtils';

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
	const initialUserRef = useRef<{ lat: number; lng: number } | null>(null);
	const [speedMs, setSpeedMs] = useState<number>(0);
	const osrmRequestedRef = useRef<boolean>(false);
	const speedResetTimerRef = useRef<number | null>(null);
	const [speedOverrideKmh, setSpeedOverrideKmh] = useState<number | null>(null);
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
			try {
				const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
					navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
				});
				currentPoint = new GeoPoint(pos.coords.latitude, pos.coords.longitude, Date.now(), pos.coords.accuracy);
			} catch {}

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

	const orderedPois = useMemo<NormalizedPOI[]>(() => {
		if (!normalizedPois.length) return [];
		const anchor = startFromUser || startVisitedPoint || (userObject?.currentLocation ? { lat: userObject.currentLocation.latitude, lng: userObject.currentLocation.longitude } : null);
		if (!anchor) return normalizedPois.slice().sort((a, b) => a.order - b.order);
		const remaining = normalizedPois.slice();
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
	}, [normalizedPois, startVisitedPoint, startFromUser, userObject]);

	// startRouteAnimation, buildConnectors, computePassedSegment importés depuis utils

	// Calculer la route OSRM: start -> user -> orderedPois
	useEffect(() => {
		const start = startFromUser || startVisitedPoint;
		const userPosStatic = initialUserRef.current; // position utilisateur initiale uniquement
		if (!orderedPois.length) return;
		if (osrmRequestedRef.current) return; // n'appeler OSRM qu'une seule fois
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

	// Appliquer les effets d'un override de vitesse (rayon + zoom) immédiatement
	useEffect(() => {
		if (speedOverrideKmh == null) return;
		setSpeedMs(speedOverrideKmh / 3.6);
		const kmh = speedOverrideKmh;
		const radius = getZoneRadiusForSpeed(kmh);
		const zoom = getZoomForSpeed(kmh);
		setUserObject(prev => {
			if (!prev) return prev;
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
			next.speed = kmh / 3.6;
			return next;
		});
		try {
			const loc = userObject?.currentLocation;
			if (loc) mapRef.current?.flyTo({ center: [loc.longitude, loc.latitude], zoom, speed: 1.0, curve: 1 });
		} catch {}
	}, [speedOverrideKmh]);


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
			const speedKmhEff = (speedOverrideKmh ?? (newSpeed * 3.6));
			const newRadius = getZoneRadiusForSpeed(speedKmhEff);
			const newZoom = getZoomForSpeed(speedKmhEff);
			const newCurrentZone = userObject.currentZone
				? new Zone({ id: userObject.currentZone.id, center: newPoint, radiusMeters: newRadius, type: 'realtime', name: userObject.currentZone.name })
				: new Zone({ id: `realtime-${Date.now()}`, center: newPoint, radiusMeters: newRadius, type: 'realtime', name: 'Realtime Zone' });
			// Déterminer si on vient de sortir de la prevZone (avant toute mise à jour)
			const leftPrevZone = userObject.prevZone ? !userObject.prevZone.contains(newPoint) : true;
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
			setUserObject(prev => {
				if (!prev) return prev;
				const next = new User({
					id: prev.id,
					name: prev.name,
					profileImageUrl: prev.profileImageUrl,
					currentLocation: newPoint,
					prevZone: prev.prevZone ?? null,
					currentZone: newCurrentZone,
					startPoint: prev.startPoint ?? null,
				});
				next.speed = newSpeed;
				next.lastLocationTimestamp = newPoint.timestamp;
				// Mettre à jour la prevZone pour suivre aussi le rayon par vitesse
				const newPrevRadius = newRadius;
				next.ensurePrevZoneContains(newPoint, newPrevRadius);
				if (next.prevZone) next.prevZone.radiusMeters = newPrevRadius;
				return next;
			});
			// Si on vient de sortir de la prevZone, envoyer la trace vers le backend via RTK Query
			if (leftPrevZone) {
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
					const visited = Array.isArray(resp?.data?.visitedTraces) ? resp.data.visitedTraces : [];
					// Vérifier distance au trajet actuel vs rayon de la zone temps réel
					let mustRecalc = true;
					try {
						const coords: number[][] | undefined = userObject?.currentTraject?.routes?.[0]?.geometry?.coordinates as any;
						const radiusMeters = userObject?.currentZone?.radiusMeters ?? 100;
						if (Array.isArray(coords) && coords.length > 1 && userObject?.currentLocation) {
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
							const start = (userObject?.startPoint ? { lng: userObject.startPoint.longitude, lat: userObject.startPoint.latitude } : (startVisitedPoint ? { lng: startVisitedPoint.lng, lat: startVisitedPoint.lat } : null));
							// Trajet A (avant) : start -> visitedTraces (ordre chrono) -> user
							const visitedSorted = [...visited].sort((a: any, b: any) => new Date(a.createdAt || a.created_at || 0).getTime() - new Date(b.createdAt || b.created_at || 0).getTime());
							const beforeParts: string[] = [];
							let computeBefore = true;
							try {
								const radiusMeters = userObject?.currentZone?.radiusMeters ?? 100;
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
		<div className="w-full h-screen">
			{/* Vitesse (carte en haut à gauche) */}
			<div className="absolute top-3 left-3 z-[1010]">
				<div className="bg-white/90 backdrop-blur rounded-md border shadow px-3 py-2">
					<div className="text-[10px] text-muted-foreground">Vitesse</div>
					<div className="text-sm font-semibold">{(speedMs * 3.6).toFixed(1)} km/h</div>
					<div className="mt-2 flex items-center gap-2">
						<input
							type="range"
							min={0}
							max={120}
							step={1}
							value={speedOverrideKmh ?? Math.round(speedMs * 3.6)}
							onChange={(e) => setSpeedOverrideKmh(Number(e.target.value))}
							className="w-40"
						/>
						<input
							type="number"
							min={0}
							max={120}
							step={1}
							value={speedOverrideKmh ?? Math.round(speedMs * 3.6)}
							onChange={(e) => setSpeedOverrideKmh(Number(e.target.value))}
							className="w-16 text-right border rounded px-1 py-0.5"
						/>
					</div>
				</div>
			</div>
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
				{orderedPois.map((poi, index) => (
					<Marker key={poi.id} longitude={poi.lng} latitude={poi.lat} anchor="bottom">
						<div className="relative cursor-pointer">
							<div className="w-10 h-10 border-2 border-emerald-600 bg-white rounded-full overflow-hidden shadow">
								{poi.img ? (
									<img src={poi.img} alt={poi.label} className="w-full h-full object-cover" />
								) : (
									<div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">POI</div>
								)}
							</div>
							<div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-emerald-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow">
								{afterPoiOrderMap[poi.id] ?? (index + 1)}
							</div>
							<div className="absolute -top-1 -right-1 bg-white text-green-600 rounded-full p-1 shadow">
								<MapPinIcon className="w-3 h-3" />
							</div>
						</div>
					</Marker>
				))}
			</Map>
		</div>
	);
}