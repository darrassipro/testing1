// client/hooks/useGPSTracker.ts
'use client';

import { useState, useEffect } from 'react';

interface GeolocationPosition {
	coords: {
		latitude: number;
		longitude: number;
		accuracy: number;
	};
}

interface GeolocationError {
	code: number;
	message: string;
}

interface GPSTrackerResult {
	position: GeolocationPosition | null;
	error: GeolocationError | null;
	startTracking: () => void;
	stopTracking: () => void;
}

/**
 * Hook pour suivre la position GPS de l'utilisateur en temps réel.
 * @param {boolean} highAccuracy - Demander une haute précision (coûte plus de batterie)
 */
export function useGPSTracker(
	highAccuracy: boolean = true
): GPSTrackerResult {
	const [position, setPosition] = useState<GeolocationPosition | null>(null);
	const [error, setError] = useState<GeolocationError | null>(null);
	const [watchId, setWatchId] = useState<number | null>(null);

	const options = {
		enableHighAccuracy: highAccuracy,
		timeout: 30000, // 30 seconds - more realistic for GPS acquisition
		maximumAge: 5000, // Accept position up to 5 seconds old
	};

	const onSuccess = (pos: GeolocationPosition) => {
		console.log('[useGPSTracker] Position updated:', {
			lat: pos.coords.latitude,
			lng: pos.coords.longitude,
			accuracy: pos.coords.accuracy
		});
		setPosition(pos);
		setError(null);
	};

	const onError = (err: GeolocationError) => {
		console.error(`[useGPSTracker] Erreur (${err.code}): ${err.message}`);
		setError(err);
	};

	const startTracking = () => {
		console.log('[useGPSTracker] Starting GPS tracking...');
		if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
			if (watchId !== null) {
				console.log('[useGPSTracker] Clearing previous watch');
				navigator.geolocation.clearWatch(watchId); // Arrêter l'ancien suivi
			}
			
			// Get initial position with more lenient options for faster response
			const quickOptions = {
				enableHighAccuracy: false, // Start with low accuracy for speed
				timeout: 10000,
				maximumAge: 30000 // Accept cached position
			};
			
			navigator.geolocation.getCurrentPosition(
				(pos) => {
					console.log('[useGPSTracker] Initial position obtained (quick)');
					onSuccess(pos);
				},
				(err) => {
					console.log('[useGPSTracker] Initial position not available (will retry with watchPosition):', err.message);
					// Don't call onError here - watchPosition will handle it
				},
				quickOptions
			);
			
			// Start continuous tracking with high accuracy
			const id = navigator.geolocation.watchPosition(
				onSuccess,
				onError,
				options
			);
			console.log('[useGPSTracker] Watch ID:', id);
			setWatchId(id);
		} else {
			console.error('[useGPSTracker] Geolocation not supported');
			setError({ code: 0, message: 'La géolocalisation n-est pas supportée.' });
		}
	};

	const stopTracking = () => {
		console.log('[useGPSTracker] Stopping GPS tracking...');
		if (watchId !== null && typeof navigator !== 'undefined') {
			navigator.geolocation.clearWatch(watchId);
			setWatchId(null);
			setPosition(null); // Optionnel: réinitialiser la position
		}
	};

	// Nettoyage automatique lorsque le composant est démonté
	useEffect(() => {
		return () => {
			if (watchId !== null && typeof navigator !== 'undefined') {
				console.log('[useGPSTracker] Cleanup: clearing watch');
				navigator.geolocation.clearWatch(watchId);
			}
		};
	}, [watchId]);

	return { position, error, startTracking, stopTracking };
}