import { useCurrentLocation } from '@/hooks/use-current-location';
import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Image,
  ScrollView,
  TextInput,
  Modal,
  Share,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { Video, ResizeMode } from 'expo-av';
import { useLocalSearchParams, useRouter, useNavigation, useFocusEffect } from 'expo-router';
import { ScreenWithHeader } from '@/components/screen';
import { Feather, MapPin, Clock, Star, Share2, ChevronLeft, ArrowLeft, Flag, Navigation } from 'lucide-react-native';
import { getCircuitById } from '@/api/circuits';
import { getPOIById, POI as POIType } from '@/api/pois';
import { Circuit, POI } from '@/types/circuit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { useStartRouteMutation } from '@/services/api/RouteApi';
import LoginModal from '@/components/auth/LoginModal';
import SignUpModal from '@/components/auth/SignUpModal';

const { height, width } = Dimensions.get('window');

interface Monument {
  id: string;
  title: string;
  type: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  order?: number;
  isCurrent?: boolean;
  isCompleted?: boolean;
}

export default function CircuitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const { currentPosition } = useCurrentLocation();
  const insets = useSafeAreaInsets();
  
  // BottomSheet snap points: 30%, 50%, 85%
  const snapPoints = useMemo(() => [height * 0.3, height * 0.5, height * 0.85], []);
  
  const [circuit, setCircuit] = useState<Circuit | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPoiId, setSelectedPoiId] = useState<string | null>(null);
  const [selectedPoiData, setSelectedPoiData] = useState<POIType | null>(null);
  const [loadingPoi, setLoadingPoi] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude?: number;
  } | null>(null);
  const [initialUserLocation, setInitialUserLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude?: number;
  } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerSrc, setViewerSrc] = useState<string | null>(null);
  const [viewerKind, setViewerKind] = useState<'image' | 'video' | 'virtualtour'>('image');
  const navigation = useNavigation();
  
  // Authentication and API
  const { user } = useSelector((state: RootState) => state.auth);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [startRoute, { isLoading: isStartingRoute }] = useStartRouteMutation();

  // Hide bottom tabs when this screen is focused
  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        tabBarStyle: { display: 'none' },
      });
      
      return () => {
        navigation.setOptions({
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopColor: '#f5f5f5ff',
            shadowOpacity: 0,
            elevation: 0,
            borderTopWidth: 1,
            height: 70,
            paddingBottom: 15,
            paddingTop: 10,
          },
        });
      };
    }, [navigation])
  );

  // Fetch circuit data
  useEffect(() => {
    if (!id) return;
    
    const fetchCircuit = async () => {
      try {
        const data = await getCircuitById(id);
        setCircuit(data);
      } catch (error) {
        console.error('Error fetching circuit:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCircuit();
  }, [id]);

  // Fonction utilitaire pour calculer la distance entre deux points (formule de Haversine)
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000; // Rayon de la Terre en mètres
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance en mètres
  }, []);

  // Fonction pour lisser la position en utilisant une moyenne pondérée
  const smoothLocation = useCallback((history: Array<{ latitude: number; longitude: number; accuracy: number; timestamp: number }>) => {
    if (history.length === 0) {
      return { latitude: 0, longitude: 0, accuracy: 100 };
    }

    if (history.length === 1) {
      return {
        latitude: history[0].latitude,
        longitude: history[0].longitude,
        accuracy: history[0].accuracy,
      };
    }

    // Calculer une moyenne pondérée (les positions les plus récentes et les plus précises ont plus de poids)
    let totalWeight = 0;
    let weightedLat = 0;
    let weightedLon = 0;
    let minAccuracy = Infinity;

    history.forEach((loc) => {
      // Poids basé sur la précision (meilleure précision = plus de poids)
      // et sur le temps (plus récent = plus de poids)
      const accuracyWeight = 1 / (loc.accuracy + 1); // +1 pour éviter division par zéro
      const timeWeight = 1; // Toutes les positions dans l'historique sont récentes
      const weight = accuracyWeight * timeWeight;

      weightedLat += loc.latitude * weight;
      weightedLon += loc.longitude * weight;
      totalWeight += weight;
      minAccuracy = Math.min(minAccuracy, loc.accuracy);
    });

    return {
      latitude: weightedLat / totalWeight,
      longitude: weightedLon / totalWeight,
      accuracy: minAccuracy, // Utiliser la meilleure précision
    };
  }, []);

  // Get user location with improved accuracy
  useEffect(() => {
    setIsLoadingLocation(true);
    
    const getInitialLocation = async () => {
      try {
        // Demander les permissions d'abord
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setIsLoadingLocation(false);
          return;
        }

        // Obtenir la position initiale avec la meilleure précision
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation,
        });

        if (location?.coords) {
          const coords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy || 10,
            altitude: location.coords.altitude ?? 0,
          };
          
          // Valider la précision (rejeter si > 100 mètres)
          if (coords.accuracy <= 100) {
            setInitialUserLocation(coords);
            setUserLocation(coords);
          } else {
            console.warn('Initial GPS accuracy too low:', coords.accuracy, 'meters');
            // Utiliser quand même mais avec un avertissement
            setInitialUserLocation(coords);
            setUserLocation(coords);
          }
        }
      } catch (error) {
        console.error('Error getting initial location:', error);
      } finally {
        setIsLoadingLocation(false);
      }
    };

    getInitialLocation();
  }, []);

  // Watch user position with improved accuracy and filtering
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    let lastValidLocation: { latitude: number; longitude: number; accuracy: number; timestamp: number } | null = null;
    const locationHistory: Array<{ latitude: number; longitude: number; accuracy: number; timestamp: number }> = [];
    const MAX_HISTORY = 5; // Garder les 5 dernières positions pour le filtrage

    const startWatching = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation, // Meilleure précision disponible
            timeInterval: 2000, // Mise à jour toutes les 2 secondes (réduit la consommation)
            distanceInterval: 3, // Mise à jour tous les 3 mètres (plus précis)
          },
          (location) => {
            if (location?.coords) {
              const now = Date.now();
              const coords = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                accuracy: location.coords.accuracy || 100,
                altitude: location.coords.altitude ?? 0,
                timestamp: now,
              };

              // Filtrer les positions avec une précision trop faible (> 50 mètres)
              if (coords.accuracy > 50) {
                console.warn('GPS accuracy too low, skipping update:', coords.accuracy, 'meters');
                // Utiliser la dernière position valide si disponible
                if (lastValidLocation && (now - lastValidLocation.timestamp) < 10000) {
                  return; // Ne pas mettre à jour si on a une position récente valide
                }
              }

              // Filtrer les sauts de position irréalistes (plus de 100 mètres en moins de 2 secondes)
              if (lastValidLocation) {
                const distance = calculateDistance(
                  lastValidLocation.latitude,
                  lastValidLocation.longitude,
                  coords.latitude,
                  coords.longitude
                );
                const timeDiff = (now - lastValidLocation.timestamp) / 1000; // en secondes
                const maxSpeed = 50; // mètres par seconde (180 km/h - vitesse maximale réaliste)
                
                if (timeDiff > 0 && distance / timeDiff > maxSpeed) {
                  console.warn('Unrealistic position jump detected, filtering out');
                  return; // Ignorer cette position
                }
              }

              // Ajouter à l'historique pour lissage
              locationHistory.push({
                latitude: coords.latitude,
                longitude: coords.longitude,
                accuracy: coords.accuracy,
                timestamp: now,
              });

              // Garder seulement les dernières positions
              if (locationHistory.length > MAX_HISTORY) {
                locationHistory.shift();
              }

              // Calculer la position moyenne pour lisser les variations
              const smoothedCoords = smoothLocation(locationHistory);

              // Mettre à jour la position
              const finalCoords = {
                latitude: smoothedCoords.latitude,
                longitude: smoothedCoords.longitude,
                accuracy: smoothedCoords.accuracy,
                altitude: coords.altitude,
              };

              lastValidLocation = {
                latitude: finalCoords.latitude,
                longitude: finalCoords.longitude,
                accuracy: finalCoords.accuracy,
                timestamp: now,
              };

              setUserLocation(finalCoords);

              // Mettre à jour la carte
              if (webViewRef.current) {
                webViewRef.current.injectJavaScript(`
                  (function() {
                    if (typeof updateUserPosition === 'function') {
                      updateUserPosition(${finalCoords.latitude}, ${finalCoords.longitude}, ${finalCoords.accuracy}, ${finalCoords.altitude});
                    }
                  })();
                  true;
                `);
              }
            }
          }
        );
      } catch (error) {
        console.error('Error watching position:', error);
      }
    };

    if (!isLoadingLocation && initialUserLocation) {
      startWatching();
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [isLoadingLocation, initialUserLocation, calculateDistance, smoothLocation]);

  // Convert POIs to monuments format
  const monuments = useMemo(() => {
    if (!circuit?.pois) {
      console.log('No POIs found in circuit');
      return [];
    }
    
    const result = circuit.pois
      .sort((a, b) => (a.CircuitPOI?.order || 0) - (b.CircuitPOI?.order || 0))
      .map((poi, index) => {
        const poiAny = poi as any;
        let coords = poiAny.coordinates;
        
        // Try different coordinate formats
        let lat = 0;
        let lng = 0;
        
        if (coords) {
          // If coordinates is a string, try to parse it as JSON
          if (typeof coords === 'string') {
            try {
              coords = JSON.parse(coords);
            } catch (e) {
              console.warn('Failed to parse coordinates string:', coords, e);
            }
          }
          
          // Now check the parsed/object coordinates
          if (coords && typeof coords === 'object') {
            // Format: {lat: number, lng: number}
            if ('lat' in coords && 'lng' in coords) {
              lat = Number(coords.lat) || 0;
              lng = Number(coords.lng) || 0;
            }
            // Format: {latitude: number, longitude: number}
            else if ('latitude' in coords && 'longitude' in coords) {
              lat = Number(coords.latitude) || 0;
              lng = Number(coords.longitude) || 0;
            }
            // GeoJSON format: {coordinates: [longitude, latitude]}
            else if (coords.coordinates && Array.isArray(coords.coordinates)) {
              lng = Number(coords.coordinates[0]) || 0;
              lat = Number(coords.coordinates[1]) || 0;
            }
          }
        }
        
        const files = (poi as any).files || [];
        const imageFile = files.find((f: any) => f.type === 'image');
        const imageUrl = imageFile?.fileUrl || (poi as any).initialImage;
        
        const monument = {
          id: poi.id,
          title: poi.frLocalization?.name || poi.enLocalization?.name || poi.arLocalization?.name || 'POI',
          type: (poi as any).categoryPOI?.fr?.name || 'Point d\'intérêt',
          latitude: lat,
          longitude: lng,
          imageUrl: imageUrl,
          order: poi.CircuitPOI?.order || index + 1,
        } as Monument;
        
        if (lat === 0 || lng === 0) {
          console.warn('POI has invalid coordinates:', poi.id, 'original coords:', poiAny.coordinates, 'parsed:', coords, 'monument:', monument);
        } else {
          console.log('POI', poi.id, 'coordinates:', lat, lng);
        }
        
        return monument;
      });
    
    console.log('Converted', result.length, 'monuments. Valid coordinates:', result.filter(m => m.latitude !== 0 && m.longitude !== 0).length);
    return result;
  }, [circuit]);

  const filteredPois = useMemo(() => {
    if (!searchQuery.trim()) return monuments;
    const q = searchQuery.toLowerCase();
    return monuments.filter(p => p.title.toLowerCase().includes(q));
  }, [monuments, searchQuery]);

  const selectedPoi = useMemo(() => {
    if (!selectedPoiId) return null;
    return monuments.find(p => p.id === selectedPoiId);
  }, [selectedPoiId, monuments]);

  const defaultCoordinates = useMemo(() => initialUserLocation || {
    latitude: monuments[0]?.latitude || 34.0626,
    longitude: monuments[0]?.longitude || -5.0077,
  }, [initialUserLocation, monuments]);

  const monumentsData = useMemo(() => JSON.stringify(monuments), [monuments]);

  // Update route and markers when monuments or user location changes
  useEffect(() => {
    if (!circuit || monuments.length === 0 || !webViewRef.current) return;
    
    // Update markers and route in the map
    webViewRef.current.injectJavaScript(`
      (function() {
        // Update monuments data first
        const newMonuments = ${monumentsData};
        if (typeof monuments !== 'undefined') {
          monuments = newMonuments;
          console.log('Updated monuments in map:', monuments.length);
        }
        
        // Update markers if function exists
        if (typeof window.updateMonumentMarkers === 'function') {
          window.updateMonumentMarkers();
        }
        
        // Then update route
        if (typeof updateCircuitRoute === 'function') {
          updateCircuitRoute();
        } else if (map && map.loaded()) {
          // If function doesn't exist yet, create and call it
          const coordsArray = [];
          
          // Add user position as starting point if available
          const currentLoc = currentLocation || window.lastKnownLocation;
          if (currentLoc) {
            coordsArray.push(currentLoc.longitude + ',' + currentLoc.latitude);
          }
          
          // Add all POIs
          newMonuments.forEach(m => {
            if (m.longitude && m.latitude && m.longitude !== 0 && m.latitude !== 0) {
              coordsArray.push(m.longitude + ',' + m.latitude);
            }
          });
          
          if (coordsArray.length < 2) {
            if (map.getSource('circuit-route')) {
              if (map.getLayer('circuit-route-layer')) {
                map.removeLayer('circuit-route-layer');
              }
              map.removeSource('circuit-route');
            }
          } else {
            const coords = coordsArray.join(';');
            const url = 'https://routing.openstreetmap.de/routed-foot/route/v1/foot/' + coords + '?overview=full&geometries=geojson&steps=false&annotations=false&alternatives=false';
            
            fetch(url)
              .then(res => {
                if (!res.ok) throw new Error('OSRM error ' + res.status);
                return res.json();
              })
              .then(data => {
                if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
                  const route = data.routes[0];
                  if (map.getSource('circuit-route')) {
                    map.getSource('circuit-route').setData({
                      type: 'Feature',
                      geometry: route.geometry
                    });
                  } else {
                    map.addSource('circuit-route', {
                      type: 'geojson',
                      data: {
                        type: 'Feature',
                        geometry: route.geometry
                      }
                    });
                    map.addLayer({
                      id: 'circuit-route-layer',
                      type: 'line',
                      source: 'circuit-route',
                      paint: {
                        'line-color': '#3b82f6',
                        'line-width': 6,
                        'line-opacity': 0.9
                      },
                      layout: {
                        'line-cap': 'round',
                        'line-join': 'round'
                      }
                    });
                  }
                }
              })
              .catch(err => console.error('Route update error:', err));
          }
        }
      })();
      true;
    `);
  }, [monuments, monumentsData, initialUserLocation, circuit]);

  const mapHTML = useMemo(() => {
    if (!circuit || monuments.length === 0) {
      return '';
    }
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js"></script>
        <link href="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css" rel="stylesheet" />
        <style>
            body { margin: 0; padding: 0; overflow: hidden; }
            #map { width: 100vw; height: 100vh; }
            .monument-marker { cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; }
            .monument-marker img { border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3); width: 50px; height: 50px; object-fit: cover; }
            .monument-marker.completed img { border: 3px solid #10b981; }
            .monument-marker.pending img { border: 3px solid #9ca3af; }
            .monument-marker.selected img { border: 4px solid #f59e0b !important; box-shadow: 0 4px 16px rgba(245, 158, 11, 0.5); }
            .user-location-marker { width: 50px; height: 50px; position: relative; display: flex; align-items: center; justify-content: center; }
            .user-location-circle-outer { position: absolute; top: 90%; left: 50%; transform: translate(-50%, -50%); width: 120px; height: 120px; border-radius: 50%; background: rgba(135, 206, 250, 0.15); border: 1px solid rgba(135, 206, 250, 0.2); z-index: 1; }
            .user-location-circle-inner { position: absolute; top: 90%; left: 50%; transform: translate(-50%, -50%); width: 80px; height: 80px; border-radius: 50%; background: rgba(135, 206, 250, 0.1); border: 1px solid rgba(135, 206, 250, 0.25); z-index: 2; }
            .user-location-dot { position: absolute; top: 90%; left: 50%; transform: translate(-50%, -50%); width: 20px; height: 20px; background: rgb(39, 79, 211); border: 2px solid white; border-radius: 50%; box-shadow: 0 0 10px 4px rgba(135, 206, 250, 0.8); z-index: 10; }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script>
            const map = new maplibregl.Map({
                container: 'map',
                style: 'https://api.maptiler.com/maps/019a213d-06f4-7ef2-be61-48b4b8fb7e56/style.json?key=cKuGgc1qdSgluaz2JWLK',
                center: [${defaultCoordinates.longitude}, ${defaultCoordinates.latitude}],
                zoom: 16,
                pitch: 0,
                bearing: 0
            });

            // Navigation controls removed

            const monuments = ${monumentsData};
            const currentLocation = ${JSON.stringify(initialUserLocation)};
            const showCircuitRoute = true;
            let selectedPoiId = null;
            let userLocationMarker = null;
            let monumentMarkers = {};
            let hasInitialZoom = false;
            
            // Function to update selected POI
            window.updateSelectedPoi = function(poiId) {
              selectedPoiId = poiId;
              // Update marker selection
              Object.values(monumentMarkers).forEach(({element}) => {
                element.classList.remove('selected');
              });
              if (poiId && monumentMarkers[poiId]) {
                monumentMarkers[poiId].element.classList.add('selected');
                // Zoom to POI
                const monument = monuments.find(m => m.id === poiId);
                if (monument && map && typeof map.flyTo === 'function') {
                  map.flyTo({
                    center: [monument.longitude, monument.latitude],
                    zoom: 16,
                    duration: 1000
                  });
                }
              }
            };

            function getMarkerSize(monument) {
                return 50;
            }

            // Function to add monument markers
            function addMonumentMarkers() {
                // Clear existing markers first
                Object.values(monumentMarkers).forEach(({ marker }) => {
                    marker.remove();
                });
                monumentMarkers = {};

                // Add monument markers
                monuments.forEach((monument, index) => {
                    // Validate coordinates
                    if (!monument.longitude || !monument.latitude || 
                        monument.longitude === 0 || monument.latitude === 0) {
                        console.warn('Invalid coordinates for monument:', monument.id, monument);
                        return;
                    }

                    const size = getMarkerSize(monument);
                    
                    const el = document.createElement('div');
                    el.className = 'monument-marker';
                    el.setAttribute('data-monument-id', monument.id);
                    
                    if (!monument.isCurrent && !monument.isCompleted) el.classList.add('pending');
                    if (selectedPoiId === monument.id) el.classList.add('selected');
                    
                    const img = document.createElement('img');
                    img.style.width = size + 'px';
                    img.style.height = size + 'px';
                    img.style.objectFit = 'cover';
                    img.src = monument.imageUrl || 'https://via.placeholder.com/50';
                    img.onerror = function() { 
                        this.src = 'https://via.placeholder.com/50/cccccc/666666?text=POI'; 
                    };
                    
                    el.appendChild(img);

                    const marker = new maplibregl.Marker({ 
                        element: el, 
                        anchor: 'center' 
                    })
                    .setLngLat([monument.longitude, monument.latitude])
                    .addTo(map);

                    monumentMarkers[monument.id] = { element: el, marker: marker };

                    el.addEventListener('click', () => {
                        if (window.ReactNativeWebView) {
                            window.ReactNativeWebView.postMessage(JSON.stringify({
                                type: 'marker_press',
                                monument: monument
                            }));
                        }
                    });
                });

                console.log('Added', Object.keys(monumentMarkers).length, 'monument markers');
            }

            function addUserLocationMarker(lat, lng) {
                if (userLocationMarker) {
                    userLocationMarker.remove();
                }

                const el = document.createElement('div');
                el.className = 'user-location-marker';
                
                const circleOuter = document.createElement('div');
                circleOuter.className = 'user-location-circle-outer';
                el.appendChild(circleOuter);
                
                const circleInner = document.createElement('div');
                circleInner.className = 'user-location-circle-inner';
                el.appendChild(circleInner);
                
                const dot = document.createElement('div');
                dot.className = 'user-location-dot';
                el.appendChild(dot);

                userLocationMarker = new maplibregl.Marker({ element: el, anchor: 'center' })
                    .setLngLat([lng, lat])
                    .addTo(map);
            }

            function updateUserPosition(lat, lng, accuracy) {
                if (userLocationMarker) {
                    userLocationMarker.setLngLat([lng, lat]);
                } else {
                    addUserLocationMarker(lat, lng);
                }
                window.lastKnownLocation = { latitude: lat, longitude: lng, accuracy: accuracy || 50 };
                
                // Update route when user location changes (without auto-zoom)
                if (typeof updateCircuitRoute === 'function') {
                    updateCircuitRoute();
                }
            }

            async function fetchRouteWithUser(coordsArray) {
                if (coordsArray.length < 2) return null;
                
                const coords = coordsArray.join(';');
                const url = 'https://routing.openstreetmap.de/routed-foot/route/v1/foot/' + coords + '?overview=full&geometries=geojson&steps=false&annotations=false&alternatives=false';
                
                try {
                    const response = await fetch(url);
                    if (!response.ok) throw new Error('OSRM error ' + response.status);
                    const data = await response.json();
                    
                    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
                        return data.routes[0];
                    }
                    return null;
                } catch (error) {
                    console.error('Route fetch error:', error);
                    return null;
                }
            }

            map.on('load', async function() {
                console.log('Map loaded, monuments count:', monuments.length);
                
                // Add monument markers first
                addMonumentMarkers();

                // Add user location marker if available
                if (currentLocation) {
                    addUserLocationMarker(currentLocation.latitude, currentLocation.longitude);
                }

                // Function to update circuit route
                async function updateCircuitRoute() {
                    // Build coordinates array: start with user position if available, then POIs
                    const coordsArray = [];
                    
                    // Add user position as starting point if available
                    const currentLoc = currentLocation || window.lastKnownLocation;
                    if (currentLoc) {
                        coordsArray.push(currentLoc.longitude + ',' + currentLoc.latitude);
                    }
                    
                    // Add all POIs in order
                    monuments.forEach(m => {
                        if (m.longitude && m.latitude && m.longitude !== 0 && m.latitude !== 0) {
                            coordsArray.push(m.longitude + ',' + m.latitude);
                        }
                    });
                    
                    // Need at least 2 points to create a route
                    if (coordsArray.length < 2) {
                        // Remove circuit route if it exists
                        if (map.getSource('circuit-route')) {
                            if (map.getLayer('circuit-route-layer')) {
                                map.removeLayer('circuit-route-layer');
                            }
                            map.removeSource('circuit-route');
                        }
                        return;
                    }
                    
                    const route = await fetchRouteWithUser(coordsArray);
                    
                    if (route) {
                        if (map.getSource('circuit-route')) {
                            map.getSource('circuit-route').setData({
                                type: 'Feature',
                                geometry: route.geometry
                            });
                        } else {
                            map.addSource('circuit-route', {
                                type: 'geojson',
                                data: {
                                    type: 'Feature',
                                    geometry: route.geometry
                                }
                            });

                            map.addLayer({
                                id: 'circuit-route-layer',
                                type: 'line',
                                source: 'circuit-route',
                                paint: {
                                    'line-color': '#3b82f6',
                                    'line-width': 6,
                                    'line-opacity': 0.9
                                },
                                layout: {
                                    'line-cap': 'round',
                                    'line-join': 'round'
                                }
                            });
                        }
                        
                        // Fit bounds to show entire route ONLY on first load
                        if (!hasInitialZoom) {
                            const coordsArr = route.geometry.coordinates;
                            if (coordsArr && coordsArr.length > 0) {
                                let minLon = Infinity, minLat = Infinity, maxLon = -Infinity, maxLat = -Infinity;
                                coordsArr.forEach(([lon, lat]) => {
                                    if (lon < minLon) minLon = lon;
                                    if (lat < minLat) minLat = lat;
                                    if (lon > maxLon) maxLon = lon;
                                    if (lat > maxLat) maxLat = lat;
                                });
                                if (Number.isFinite(minLon)) {
                                    map.fitBounds([[minLon, minLat], [maxLon, maxLat]], { 
                                        padding: 60, 
                                        duration: 800 
                                    });
                                    hasInitialZoom = true;
                                }
                            }
                        }
                    }
                }

                // Update circuit route when monuments or showCircuitRoute changes
                await updateCircuitRoute();

                // Watch for monuments changes to update circuit route
                let previousMonumentsLength = monuments.length;
                const checkMonumentsChange = setInterval(() => {
                    if (monuments.length !== previousMonumentsLength || 
                        (showCircuitRoute && monuments.length >= 2 && !map.getSource('circuit-route'))) {
                        updateCircuitRoute();
                        previousMonumentsLength = monuments.length;
                    }
                }, 500);

                // Cleanup interval on unmount
                window.addEventListener('beforeunload', () => {
                    clearInterval(checkMonumentsChange);
                });

                // Expose function to update markers from React Native
                window.updateMonumentMarkers = function() {
                    addMonumentMarkers();
                };
                
                // Expose function to update route from React Native
                window.updateCircuitRoute = updateCircuitRoute;
            });
        </script>
    </body>
    </html>
  `;
  }, [circuit, monumentsData, defaultCoordinates, initialUserLocation]);

  const handleMarkerPress = async (monument: Monument) => {
    setSelectedPoiId(monument.id);
    setLoadingPoi(true);
    
    // Zoom to POI without refreshing the map - use exposed function
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        (function() {
          if (typeof window.updateSelectedPoi === 'function') {
            window.updateSelectedPoi('${monument.id}');
          }
        })();
        true;
      `);
    }
    
    try {
      const poiData = await getPOIById(monument.id);
      setSelectedPoiData(poiData);
    } catch (error) {
      console.error('Error fetching POI details:', error);
    } finally {
      setLoadingPoi(false);
    }
  };

  const handleBackToList = () => {
    setSelectedPoiId(null);
  };

  const handleShare = async () => {
    if (!circuit) return;
    
    try {
      const circuitName = circuit?.fr?.name || circuit?.en?.name || circuit?.ar?.name || 'Circuit';
      const message = `Découvrez ce circuit: ${circuitName}`;
      
      const result = await Share.share({
        message: message,
        title: circuitName,
      });
      
      if (result.action === Share.sharedAction) {
        console.log('Circuit shared successfully');
      }
    } catch (error: any) {
      console.error('Error sharing circuit:', error);
      Alert.alert('Erreur', 'Impossible de partager le circuit');
    }
  };

  const handleStart = async () => {
    if (!circuit?.id) return;
    
    // Vérifier si l'utilisateur est authentifié
    if (!user) {
      setIsLoginOpen(true);
      Alert.alert('Connexion requise', 'Veuillez vous connecter pour démarrer le circuit');
      return;
    }
    
    // Vérifier si la position GPS est disponible
    if (!userLocation) {
      Alert.alert('GPS requis', 'Veuillez activer le GPS pour démarrer le circuit');
      return;
    }
    
    try {
      const result = await startRoute({
        circuitId: circuit.id,
        longitude: userLocation.longitude,
        latitude: userLocation.latitude,
      }).unwrap();
      
      if (result.status && result.data?.firstTrace) {
        const routeId = result.data.firstTrace.routeId;
        // Naviguer vers l'écran de navigation
        router.push({
          pathname: '/(tabs)/circuit-route',
          params: { id: routeId },
        } as any);
      } else {
        Alert.alert('Succès', 'Circuit démarré avec succès!');
      }
    } catch (error: any) {
      console.error('Error starting route:', error);
      const errorMessage = error?.data?.message || error?.message || 'Erreur lors du démarrage du circuit';
      Alert.alert('Erreur', errorMessage);
    }
  };

  const handleSheetChanges = useCallback((index: number) => {
    console.log('BottomSheet index changed to:', index);
  }, []);

  if (loading || isLoadingLocation) {
    return (
      <ScreenWithHeader
        leftIcon={
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
        }
        headerTitle="Circuit"
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </ScreenWithHeader>
    );
  }

  if (!circuit) {
    return (
      <ScreenWithHeader
        leftIcon={
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
        }
        headerTitle="Circuit"
      >
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Circuit non trouvé</Text>
        </View>
      </ScreenWithHeader>
    );
  }

  const locale = 'fr' as 'fr' | 'en' | 'ar';
  const circuitName = circuit?.[locale]?.name || circuit?.fr?.name || 'Circuit';
  const circuitDescription = circuit?.[locale]?.description || circuit?.fr?.description || '';
  const circuitImage = circuit?.image || '/images/hero.jpg';
  const cityName = circuit?.city?.name || '';

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'marker_press' && data.monument) {
        handleMarkerPress(data.monument);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container}>
        {/* Map View */}
        <View style={styles.mapContainer}>
          <WebView
            ref={webViewRef}
            source={{ html: mapHTML }}
            style={styles.map}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            geolocationEnabled={true}
            onMessage={handleWebViewMessage}
          />
        </View>

        {/* BottomSheet */}
        <BottomSheet
          ref={bottomSheetRef}
          index={1} // Start at 50%
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
          enablePanDownToClose={false}
          handleIndicatorStyle={styles.bottomSheetIndicator}
        >
          <BottomSheetScrollView 
            style={styles.bottomSheetContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.bottomSheetContentContainer}
          >
          {/* Header */}
          {!selectedPoiId && (
            <View style={styles.header}>
              <Image source={{ uri: circuitImage }} style={styles.headerImage} />
              <View style={styles.headerInfo}>
                {cityName ? <Text style={styles.cityName}>{cityName}</Text> : null}
                <View style={styles.titleRow}>
                  <Text style={styles.title} numberOfLines={1}>{circuitName}</Text>
                  <View style={styles.langBadge}>
                    <Text style={styles.langBadgeText}>{locale.toUpperCase()}</Text>
                  </View>
                </View>
                <View style={styles.ratingRow}>
                  <Star size={16} fill="#ff932e" color="#ff932e" />
                  <Text style={styles.rating}>{circuit.rating?.toFixed(1) || '0.0'}</Text>
                  <Text style={styles.reviewCount}>( {circuit.reviewCount || 0} reviews )</Text>
                </View>
              </View>
            </View>
          )}

          {/* Circuit Info */}
          {!selectedPoiId && (
            <View style={styles.circuitInfo}>
              <View style={styles.infoItem}>
                <MapPin size={16} color="#3b82f6" />
                <Text style={styles.infoText}>{circuit.distance || '-'} km</Text>
              </View>
              <View style={styles.infoItem}>
                <Clock size={16} color="#3b82f6" />
                <Text style={styles.infoText}>{circuit.duration || '-'} min</Text>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          {!selectedPoiId && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.startButton, (isStartingRoute || !userLocation) && styles.startButtonDisabled]}
                onPress={handleStart}
                disabled={isStartingRoute || !userLocation}
              >
                {isStartingRoute ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Navigation size={16} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.startButtonText}>Démarrer</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={handleShare}
              >
                <Share2 size={16} color="#10b981" style={{ marginRight: 8 }} />
                <Text style={styles.shareButtonText}>Partager</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Search Bar */}
          {!selectedPoiId && (
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher un POI..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#9ca3af"
              />
            </View>
          )}

          {/* POI List or Detail */}
          {selectedPoiId ? (
            <View style={styles.poiDetail}>
              <TouchableOpacity style={styles.backButton} onPress={() => {
                setSelectedPoiId(null);
                setSelectedPoiData(null);
              }}>
                <ChevronLeft size={20} color="#000" />
              </TouchableOpacity>
              <Text style={styles.detailTitle}>Détail du POI</Text>
              
              {loadingPoi ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#3b82f6" />
                  <Text style={styles.loadingText}>Chargement...</Text>
                </View>
              ) : selectedPoiData ? (
                <View>
                  {/* Primary Image */}
                  {(() => {
                    const files = selectedPoiData.files || [];
                    const imageFiles = files.filter(f => f.type === 'image');
                    const primaryImage = imageFiles[0]?.fileUrl || (selectedPoiData as any).initialImage;
                    
                    return primaryImage ? (
                      <Image source={{ uri: primaryImage }} style={styles.poiImage} />
                    ) : null;
                  })()}
                  
                  {/* POI Name and Address */}
                  <View style={styles.poiHeader}>
                    <Text style={styles.poiAddress}>
                      {selectedPoiData.coordinates && typeof selectedPoiData.coordinates === 'object' && 'address' in selectedPoiData.coordinates
                        ? selectedPoiData.coordinates.address
                        : selectedPoiData.city?.name || ''}
                    </Text>
                    <Text style={styles.poiName}>
                      {selectedPoiData.frLocalization?.name || 
                       selectedPoiData.enLocalization?.name || 
                       selectedPoiData.arLocalization?.name || 
                       'POI'}
                    </Text>
                  </View>
                  
                  {/* Description */}
                  {(() => {
                    const desc = selectedPoiData.frLocalization?.description || 
                                selectedPoiData.enLocalization?.description || 
                                selectedPoiData.arLocalization?.description || '';
                    return desc ? (
                      <Text style={styles.poiDescription}>{desc}</Text>
                    ) : null;
                  })()}
                  
                  {/* Audio */}
                  {(() => {
                    const locKey = 'fr' as 'fr' | 'en' | 'ar';
                    const locObj = selectedPoiData[`${locKey}Localization`] || 
                                  selectedPoiData.frLocalization || 
                                  selectedPoiData.enLocalization || 
                                  selectedPoiData.arLocalization;
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
                    
                    return audioUrl ? (
                      <View style={styles.audioContainer}>
                        <Text style={styles.audioLabel}>Audio disponible</Text>
                        <Text style={styles.audioUrl} numberOfLines={1}>{audioUrl}</Text>
                        {/* TODO: Implement audio player */}
                      </View>
                    ) : null;
                  })()}
                  
                  {/* Media Files (Images & Videos) */}
                  {(() => {
                    const files = selectedPoiData.files || [];
                    const imageFiles = files.filter(f => f.type === 'image');
                    const videoFiles = files.filter(f => f.type === 'video');
                    const mediaFiles = [...imageFiles, ...videoFiles];
                    
                    return mediaFiles.length > 0 ? (
                      <View style={styles.mediaGrid}>
                        {mediaFiles.map((file, index) => {
                          const isVideo = file.type === 'video';
                          const isImage = file.type === 'image';
                          return (
                            <TouchableOpacity
                              key={file.id || index}
                              style={styles.mediaItem}
                              onPress={() => {
                                setViewerKind(isVideo ? 'video' : 'image');
                                setViewerSrc(file.fileUrl);
                                setViewerOpen(true);
                              }}
                            >
                              {isImage ? (
                                <Image source={{ uri: file.fileUrl }} style={styles.mediaImage} />
                              ) : (
                                <View style={styles.videoThumbnailContainer}>
                                  <View style={styles.videoOverlay}>
                                    <Text style={styles.playIcon}>▶</Text>
                                  </View>
                                </View>
                              )}
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    ) : null;
                  })()}
                  
                  {/* Virtual Tour */}
                  {(() => {
                    const files = selectedPoiData.files || [];
                    const virtualTour = files.find(f => f.type === 'virtualtour');
                    
                    return virtualTour?.fileUrl ? (
                      <View style={styles.virtualTourContainer}>
                        <Text style={styles.virtualTourLabel}>Visite virtuelle</Text>
                        <WebView
                          source={{ uri: virtualTour.fileUrl }}
                          style={styles.virtualTourWebView}
                          javaScriptEnabled={true}
                          domStorageEnabled={true}
                          allowsFullscreenVideo={true}
                        />
                      </View>
                    ) : null;
                  })()}
                  
                  {/* Category */}
                  {selectedPoiData.categoryPOI && (() => {
                    const cat = selectedPoiData.categoryPOI;
                    const parseLoc = (val: any) => {
                      if (!val) return null;
                      if (typeof val === 'string') {
                        try { return JSON.parse(val); } catch { return null; }
                      }
                      return typeof val === 'object' ? val : null;
                    };
                    const catName = parseLoc(cat.fr)?.name || parseLoc(cat.en)?.name || parseLoc(cat.ar)?.name || '';
                    
                    return catName ? (
                      <View style={styles.categoryContainer}>
                        {cat.icon && (
                          <Image source={{ uri: cat.icon }} style={styles.categoryIcon} />
                        )}
                        <Text style={styles.categoryText}>
                          Catégorie: <Text style={styles.categoryName}>{catName}</Text>
                        </Text>
                      </View>
                    ) : null;
                  })()}
                  
                  {/* City */}
                  {selectedPoiData.city && (() => {
                    const cityName = selectedPoiData.city.nameAr || 
                                    selectedPoiData.city.nameEn || 
                                    selectedPoiData.city.name || '';
                    const cityImage = selectedPoiData.city.image;
                    
                    return cityName ? (
                      <View style={styles.cityContainer}>
                        {cityImage && (
                          <Image source={{ uri: cityImage }} style={styles.cityImage} />
                        )}
                        <Text style={styles.cityText}>
                          Ville: <Text style={styles.cityNameText}>{cityName}</Text>
                        </Text>
                      </View>
                    ) : null;
                  })()}
                </View>
              ) : (
                <Text style={styles.errorText}>Aucune donnée disponible</Text>
              )}
            </View>
          ) : (
            <View style={styles.poiList}>
              <Text style={styles.sectionTitle}>Étapes du circuit</Text>
              <Text style={styles.sectionSubtitle}>Affichage uniquement (ordre serveur)</Text>
              
              {filteredPois.map((poi, index) => {
                const isStart = index === 0;
                const isEnd = index === filteredPois.length - 1;
                
                return (
                  <TouchableOpacity
                    key={poi.id}
                    style={styles.poiItem}
                    onPress={async () => {
                      await handleMarkerPress(poi);
                      // Zoom to POI without refreshing the map - use exposed function
                      if (webViewRef.current) {
                        webViewRef.current.injectJavaScript(`
                          (function() {
                            if (typeof window.updateSelectedPoi === 'function') {
                              window.updateSelectedPoi('${poi.id}');
                            }
                          })();
                          true;
                        `);
                      }
                    }}
                  >
                    <View style={styles.poiImageContainer}>
                      {poi.imageUrl ? (
                        <Image source={{ uri: poi.imageUrl }} style={styles.poiThumbnail} />
                      ) : (
                        <View style={styles.poiPlaceholder}>
                          <Text style={styles.poiPlaceholderText}>POI</Text>
                        </View>
                      )}
                      {isStart && (
                        <View style={styles.startBadge}>
                          <MapPin size={14} color="#10b981" />
                        </View>
                      )}
                      {isEnd && filteredPois.length > 1 && (
                        <View style={styles.endBadge}>
                          <Flag size={14} color="#ef4444" />
                        </View>
                      )}
                    </View>
                    <View style={styles.poiInfo}>
                      <View style={styles.poiInfoRow}>
                        <Text style={styles.poiLabel} numberOfLines={1}>{poi.title}</Text>
                        <View style={styles.orderBadge}>
                          <Text style={styles.orderBadgeText}>#{index + 1}</Text>
                        </View>
                      </View>
                      <Text style={styles.poiCoords}>
                        {poi.latitude.toFixed(4)}, {poi.longitude.toFixed(4)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
          </BottomSheetScrollView>
        </BottomSheet>
        
        {/* Media Viewer Modal (Fullscreen) */}
        <Modal
          visible={viewerOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => {
            setViewerOpen(false);
            setViewerSrc(null);
          }}
        >
          <TouchableOpacity
            style={styles.viewerOverlay}
            activeOpacity={1}
            onPress={() => {
              setViewerOpen(false);
              setViewerSrc(null);
            }}
          >
            <View style={styles.viewerContent} onStartShouldSetResponder={() => true}>
              <TouchableOpacity
                style={styles.viewerCloseButton}
                onPress={() => {
                  setViewerOpen(false);
                  setViewerSrc(null);
                }}
              >
                <Text style={styles.viewerCloseText}>×</Text>
              </TouchableOpacity>
              
              {viewerKind === 'image' && viewerSrc ? (
                <Image
                  source={{ uri: viewerSrc }}
                  style={styles.viewerImage}
                  resizeMode="contain"
                />
              ) : viewerKind === 'video' && viewerSrc ? (
                <View style={styles.viewerVideoContainer}>
                  <Video
                    source={{ uri: viewerSrc }}
                    style={styles.viewerVideo}
                    useNativeControls
                    resizeMode={ResizeMode.CONTAIN}
                    shouldPlay={false}
                    isLooping={false}
                  />
                </View>
              ) : null}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Login Modal */}
        <LoginModal
          visible={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
          onSwitchToSignUp={() => {
            setIsLoginOpen(false);
            setIsSignUpOpen(true);
          }}
        />

        {/* SignUp Modal */}
        <SignUpModal
          visible={isSignUpOpen}
          onClose={() => setIsSignUpOpen(false)}
          onSwitchToLogin={() => {
            setIsSignUpOpen(false);
            setIsLoginOpen(true);
          }}
        />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  bottomSheetIndicator: {
    backgroundColor: '#ccc',
    width: 40,
  },
  bottomSheetContent: {
    flex: 1,
  },
  bottomSheetContentContainer: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 12,
  },
  headerImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cityName: {
    fontSize: 12,
    color: '#6b7280',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  langBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  langBadgeText: {
    fontSize: 10,
    color: '#374151',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  circuitInfo: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  infoText: {
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInput: {
    height: 36,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  poiList: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 16,
  },
  poiItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 12,
  },
  poiImageContainer: {
    position: 'relative',
  },
  poiThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  poiPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  poiPlaceholderText: {
    fontSize: 10,
    color: '#6b7280',
  },
  startBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
  },
  endBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
  },
  poiInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  poiInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  poiLabel: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  orderBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  orderBadgeText: {
    fontSize: 11,
    color: '#3b82f6',
    fontWeight: '600',
  },
  poiCoords: {
    fontSize: 12,
    color: '#6b7280',
  },
  poiDetail: {
    padding: 16,
  },
  backButton: {
    marginBottom: 12,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  poiImage: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#f3f4f6',
  },
  poiName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  poiType: {
    fontSize: 14,
    color: '#6b7280',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
  },
  poiHeader: {
    marginBottom: 12,
  },
  poiAddress: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  poiDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
    marginBottom: 16,
  },
  audioContainer: {
    marginVertical: 12,
  },
  audioLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  audioUrl: {
    fontSize: 12,
    color: '#6b7280',
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 12,
  },
  mediaItem: {
    width: (width - 64) / 3, // 3 columns with padding
    aspectRatio: 16 / 9,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  videoThumbnailContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  virtualTourContainer: {
    marginVertical: 12,
  },
  virtualTourLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  virtualTourWebView: {
    width: '100%',
    height: 224, // h-56 equivalent (14 * 16)
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  viewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  viewerContent: {
    width: '100%',
    maxWidth: width * 0.9,
    maxHeight: height * 0.85,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  viewerCloseButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  viewerCloseText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  viewerImage: {
    width: '100%',
    height: height * 0.85,
  },
  viewerVideoContainer: {
    width: '100%',
    height: height * 0.85,
  },
  viewerVideo: {
    width: '100%',
    height: '100%',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 12,
  },
  categoryIcon: {
    width: 24,
    height: 24,
  },
  categoryText: {
    fontSize: 14,
    color: '#6b7280',
  },
  categoryName: {
    fontWeight: '600',
    color: '#374151',
  },
  cityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 12,
  },
  cityImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cityText: {
    fontSize: 14,
    color: '#6b7280',
  },
  cityNameText: {
    fontWeight: '600',
    color: '#374151',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  startButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 6,
  },
  startButtonDisabled: {
    backgroundColor: '#9ca3af',
    opacity: 0.6,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 6,
  },
  shareButtonText: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: '600',
  },
});

