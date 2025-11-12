import type { GeoJSON } from 'geojson';
import { GeoPoint, GeoUtils } from '@/lib/geo';

export function zoneToPolygon(zone: { center: GeoPoint; radiusMeters: number } | null): GeoJSON.FeatureCollection | null {
	if (!zone) return null;
	const steps = 64;
	const coords: number[][] = [];
	const R = 6371000;
	const lat = zone.center.latitude * Math.PI / 180;
	const lon = zone.center.longitude * Math.PI / 180;
	const d = zone.radiusMeters / R;
	for (let i = 0; i <= steps; i++) {
		const brg = (i / steps) * 2 * Math.PI;
		const lat2 = Math.asin(Math.sin(lat) * Math.cos(d) + Math.cos(lat) * Math.sin(d) * Math.cos(brg));
		const lon2 = lon + Math.atan2(Math.sin(brg) * Math.sin(d) * Math.cos(lat), Math.cos(d) - Math.sin(lat) * Math.sin(lat2));
		coords.push([lon2 * 180 / Math.PI, lat2 * 180 / Math.PI]);
	}
	return {
		type: 'FeatureCollection',
		features: [
			{ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [coords] } as GeoJSON.Polygon },
		],
	};
}

export function buildConnectors(lineGeometry: any, ordered: Array<{ lat: number; lng: number; label?: string }>) {
	if (!lineGeometry || !lineGeometry.coordinates || lineGeometry.coordinates.length < 2) return null;
	const coords = lineGeometry.coordinates as number[][];
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
}

export function computePassedSegment(
	lineGeometry: any,
	userLngLat: { lng: number; lat: number },
	startLngLat: { lng: number; lat: number }
) {
	try {
		if (!lineGeometry || !Array.isArray(lineGeometry.coordinates)) return null;
		const coords: number[][] = lineGeometry.coordinates as number[][];
		if (coords.length < 2) return null;

		let projBest: { pt: [number, number]; i: number; t: number; d2: number } | null = null;
		const p: [number, number] = [userLngLat.lng, userLngLat.lat];
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
			if (!projBest || d2 < projBest.d2) projBest = { pt: [qx, qy], i, t, d2 };
		}
		if (!projBest) return null;

		const s: [number, number] = [startLngLat.lng, startLngLat.lat];
		let startIdx = 0;
		let bestS = Infinity;
		for (let i = 0; i < coords.length; i++) {
			const dx = coords[i][0] - s[0];
			const dy = coords[i][1] - s[1];
			const d2 = dx * dx + dy * dy;
			if (d2 < bestS) { bestS = d2; startIdx = i; }
		}

		const iProj = projBest.i;
		const tProj = projBest.t;
		const projPoint = projBest.pt;
		let segmentCoords: number[][] = [];
		if (startIdx <= iProj) {
			segmentCoords = coords.slice(startIdx, iProj + 1);
			if (tProj > 0 && tProj < 1) {
				segmentCoords[segmentCoords.length - 1] = projPoint;
			} else if (tProj >= 1) {
				segmentCoords.push(projPoint);
			}
		} else {
			segmentCoords = coords.slice(iProj, startIdx + 1).slice().reverse();
			if (tProj > 0 && tProj < 1) {
				segmentCoords[0] = projPoint;
			} else if (tProj <= 0) {
				segmentCoords.unshift(projPoint);
			}
		}
		if (segmentCoords.length < 2) return null;
		return {
			type: 'FeatureCollection',
			features: [
				{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: segmentCoords } }
			]
		};
	} catch {
		return null;
	}
}

export function startRouteAnimation(
	coordsRaw: number[][],
	setRouteAnimatedGeoJSON: (geo: any) => void,
	routeAnimFrameRef: { current: number | null },
	duration: number = 1000
) {
	const valid = (c: any) => Array.isArray(c) && Number.isFinite(c[0]) && Number.isFinite(c[1]);
	const coords = (coordsRaw || []).filter(valid);
	if (!coords || coords.length < 2) {
		setRouteAnimatedGeoJSON(null);
		return;
	}
	if (routeAnimFrameRef.current) cancelAnimationFrame(routeAnimFrameRef.current);
	const start = performance.now();
	const maxIndex = coords.length - 1;
	if (maxIndex === 0) {
		setRouteAnimatedGeoJSON({ type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coords } }] });
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
		setRouteAnimatedGeoJSON({ type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: partial } }] });
		if (progress < 1) {
			routeAnimFrameRef.current = requestAnimationFrame(step);
		} else {
			routeAnimFrameRef.current = null;
		}
	};
	routeAnimFrameRef.current = requestAnimationFrame(step);
}

export const getZoneRadiusForSpeed = (kmh: number) => {
	if (kmh <= 20) return 100;
	if (kmh < 50) return 250;
	return 450;
};

export const getZoomForSpeed = (kmh: number) => {
	if (kmh <= 20) return 16;
	if (kmh < 50) return 15;
	return 14;
};


