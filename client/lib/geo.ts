// Geo and OSRM classes
export class GeoPoint {
	constructor(
		public latitude: number,
		public longitude: number,
		public timestamp: number = Date.now(),
		public accuracy?: number
	) {}
}

export class Zone {
	id: string;
	name?: string;
	center: GeoPoint;
	radiusMeters: number;
	type: 'fixed' | 'realtime';
	createdAt?: Date;

	constructor(params: {
		id: string;
		center: GeoPoint;
		radiusMeters: number;
		type?: 'fixed' | 'realtime';
		name?: string;
	}) {
		this.id = params.id;
		this.center = params.center;
		this.radiusMeters = params.radiusMeters;
		this.type = params.type ?? 'fixed';
		this.name = params.name;
		this.createdAt = new Date();
	}

	contains(point: GeoPoint): boolean {
		const d = GeoUtils.distanceMeters(this.center, point);
		return d <= this.radiusMeters;
	}
}

export class User {
	id: string;
	name?: string;
	profileImageUrl?: string;
	currentLocation?: GeoPoint;
	prevZone?: Zone | null;
	currentZone?: Zone | null;
	lastLocationTimestamp?: number;
	speed: number = 0;
	avgSpeed: number = 0;
	speedHistory: number[] = [];
	currentTraject?: Traject | null;
	prevTraject?: Traject | null;
	startPoint?: GeoPoint | null;

	constructor(params: {
		id: string;
		name?: string;
		profileImageUrl?: string;
		currentLocation?: GeoPoint;
		prevZone?: Zone | null;
		currentZone?: Zone | null;
		currentTraject?: Traject | null;
		prevTraject?: Traject | null;
		startPoint?: GeoPoint | null;
	}) {
		this.id = params.id;
		this.name = params.name;
		this.profileImageUrl = params.profileImageUrl;
		this.currentLocation = params.currentLocation;
		this.prevZone = params.prevZone ?? null;
		this.currentZone = params.currentZone ?? null;
		this.currentTraject = params.currentTraject ?? null;
		this.prevTraject = params.prevTraject ?? null;
		this.startPoint = params.startPoint ?? null;
	}

	ensurePrevZoneContains(newLocation: GeoPoint, defaultRadius: number = 200) {
		const radius = this.prevZone?.radiusMeters ?? defaultRadius;
		if (!this.prevZone || !this.prevZone.contains(newLocation)) {
			this.prevZone = new Zone({
				id: `prev-${Date.now()}`,
				center: newLocation,
				radiusMeters: radius,
				type: 'fixed',
				name: this.prevZone?.name ?? 'Previous Zone',
			});
		}
	}

	updateSpeed(newLocation: GeoPoint) {
		if (!this.currentLocation) {
			this.currentLocation = newLocation;
			this.lastLocationTimestamp = newLocation.timestamp;
			return;
		}
		const distance = GeoUtils.distanceMeters(this.currentLocation, newLocation);
		const timeDiff = (newLocation.timestamp - this.currentLocation.timestamp) / 1000;
		if (timeDiff <= 0 || distance < 0.5) return;
		const rawSpeed = distance / timeDiff;
		const filtered = GeoUtils.smoothSpeed(this.speedHistory, rawSpeed);
		if (filtered > 50) return;
		this.speed = filtered;
		this.speedHistory.push(filtered);
		if (this.speedHistory.length > 10) this.speedHistory.shift();
		this.avgSpeed = this.speedHistory.reduce((a, b) => a + b, 0) / this.speedHistory.length;
		this.currentLocation = newLocation;
		this.lastLocationTimestamp = newLocation.timestamp;
	}
}

export class GeoUtils {
	static distanceMeters(a: GeoPoint, b: GeoPoint): number {
		const R = 6371000;
		const toRad = (deg: number) => (deg * Math.PI) / 180;
		const dLat = toRad(b.latitude - a.latitude);
		const dLon = toRad(b.longitude - a.longitude);
		const lat1 = toRad(a.latitude);
		const lat2 = toRad(b.latitude);
		const hav = Math.sin(dLat / 2) ** 2 +
			Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
		const c = 2 * Math.atan2(Math.sqrt(hav), Math.sqrt(1 - hav));
		return R * c;
	}

	static smoothSpeed(history: number[], newSpeed: number): number {
		const window = [...history.slice(-4), newSpeed];
		return window.reduce((a, b) => a + b, 0) / window.length;
	}
}

export type OSRMLonLat = [number, number];

export class OSRMLeg {
	steps: any[];
	weight: number;
	summary: string;
	duration: number;
	distance: number;
	constructor(raw: any) {
		this.steps = Array.isArray(raw?.steps) ? raw.steps : [];
		this.weight = Number(raw?.weight ?? 0);
		this.summary = String(raw?.summary ?? '');
		this.duration = Number(raw?.duration ?? 0);
		this.distance = Number(raw?.distance ?? 0);
	}
}

export class OSRMGeometry {
	type: string;
	coordinates: OSRMLonLat[];
	constructor(raw: any) {
		this.type = String(raw?.type ?? 'LineString');
		const coords = Array.isArray(raw?.coordinates) ? raw.coordinates : [];
		this.coordinates = coords.filter((c: any) => Array.isArray(c) && Number.isFinite(c[0]) && Number.isFinite(c[1]));
	}
}

export class OSRMRoute {
	legs: OSRMLeg[];
	weight_name: string;
	geometry: OSRMGeometry;
	weight: number;
	duration: number;
	distance: number;
	constructor(raw: any) {
		this.legs = Array.isArray(raw?.legs) ? raw.legs.map((l: any) => new OSRMLeg(l)) : [];
		this.weight_name = String(raw?.weight_name ?? '');
		this.geometry = new OSRMGeometry(raw?.geometry ?? {});
		this.weight = Number(raw?.weight ?? 0);
		this.duration = Number(raw?.duration ?? 0);
		this.distance = Number(raw?.distance ?? 0);
	}
}

export class OSRMWaypoint {
	hint?: string;
	location: OSRMLonLat;
	name: string;
	distance?: number;
	constructor(raw: any) {
		this.hint = raw?.hint;
		this.location = Array.isArray(raw?.location) ? raw.location as OSRMLonLat : [0, 0];
		this.name = String(raw?.name ?? '');
		this.distance = typeof raw?.distance === 'number' ? raw.distance : undefined;
	}
}

export class Traject {
	code: string;
	routes: OSRMRoute[];
	waypoints: OSRMWaypoint[];
	createdAt: number;
	constructor(raw: any) {
		this.code = String(raw?.code ?? '');
		this.routes = Array.isArray(raw?.routes) ? raw.routes.map((r: any) => new OSRMRoute(r)) : [];
		this.waypoints = Array.isArray(raw?.waypoints) ? raw.waypoints.map((w: any) => new OSRMWaypoint(w)) : [];
		this.createdAt = Date.now();
	}
}



