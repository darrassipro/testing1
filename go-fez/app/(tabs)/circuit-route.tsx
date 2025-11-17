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
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { Video, ResizeMode } from 'expo-av';
import { useLocalSearchParams, useRouter, useNavigation, useFocusEffect } from 'expo-router';
import { ScreenWithHeader } from '@/components/screen';
import { MapPin, Clock, Star, ChevronLeft, ArrowLeft, Flag, X, Plus, CheckCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import {
  useGetRouteByIdQuery,
  useAddVisitedTraceMutation,
  useRemovePOIFromRouteMutation,
  useAddPOIToRouteMutation,
} from '@/services/api/RouteApi';
import { getPOIById, POI as POIType } from '@/api/pois';
import { skipToken } from '@reduxjs/toolkit/query';

const { height, width } = Dimensions.get('window');

interface Monument {
  id: string;
  title: string;
  type: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  order?: number;
  isVisited?: boolean;
  isRemoved?: boolean;
}

const PROXIMITY_DISTANCE = 15; // 15 mètres
const VISIT_DURATION = 30; // 30 secondes

export default function CircuitRouteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  
  // BottomSheet snap points
  const snapPoints = useMemo(() => [height * 0.3, height * 0.5, height * 0.85], []);
  
  // API hooks
  const { data: routeResp, refetch: refetchRoute } = useGetRouteByIdQuery(id || '', {
    skip: !id,
    pollingInterval: 5000, // Refresh every 5 seconds
  });
  const [addVisitedTrace] = useAddVisitedTraceMutation();
  const [removePOI] = useRemovePOIFromRouteMutation();
  const [addPOI] = useAddPOIToRouteMutation();
  
  // State
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
  
  // POI visit tracking
  const [poiVisitTimers, setPoiVisitTimers] = useState<Record<string, { startTime: number; remainingSeconds: number }>>({});
  const poiVisitTimersRef = useRef<Record<string, NodeJS.Timeout>>({});
  const [visitingPoiId, setVisitingPoiId] = useState<string | null>(null);
  const [lastTraceTime, setLastTraceTime] = useState<number>(0);
  
  const { user } = useSelector((state: RootState) => state.auth);
  
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

  // Get route data
  const routeData = routeResp as any;
  const visitedTraces = routeData?.data?.visitedTraces || [];
  const removedTraces = routeData?.data?.removedTraces || [];
  const visitedPoiIds = useMemo(() => new Set(
    visitedTraces.map((t: any) => String((t.poiId ?? t.idPoi ?? '') || '')).filter(Boolean)
  ), [visitedTraces]);
  const removedPoiIds = useMemo(() => new Set(
    removedTraces.map((t: any) => String(t.poiId || '')).filter(Boolean)
  ), [removedTraces]);

  // Get user location
  useEffect(() => {
    setIsLoadingLocation(true);
    
    const getInitialLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setIsLoadingLocation(false);
          return;
        }

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
          
          setInitialUserLocation(coords);
          setUserLocation(coords);
        }
      } catch (error) {
        console.error('Error getting initial location:', error);
      } finally {
        setIsLoadingLocation(false);
        setLoading(false);
      }
    };

    getInitialLocation();
  }, []);

  // Watch user position and send traces
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    const startWatching = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 2000,
            distanceInterval: 3,
          },
          async (location) => {
            if (location?.coords && id) {
              const coords = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                accuracy: location.coords.accuracy || 100,
                altitude: location.coords.altitude ?? 0,
              };

              setUserLocation(coords);

              // Send GPS trace every 30 seconds
              const now = Date.now();
              if (now - lastTraceTime >= 30000) {
                try {
                  await addVisitedTrace({
                    routeId: id,
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                  }).unwrap();
                  setLastTraceTime(now);
                } catch (error) {
                  console.error('Failed to send GPS trace:', error);
                }
              }

              // Update map
              if (webViewRef.current) {
                webViewRef.current.injectJavaScript(`
                  (function() {
                    if (typeof updateUserPosition === 'function') {
                      updateUserPosition(${coords.latitude}, ${coords.longitude}, ${coords.accuracy}, ${coords.altitude});
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

    if (!isLoadingLocation && initialUserLocation && id) {
      startWatching();
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
      // Cleanup timers
      Object.values(poiVisitTimersRef.current).forEach(timer => {
        if (timer) clearInterval(timer);
      });
    };
  }, [isLoadingLocation, initialUserLocation, id, lastTraceTime, addVisitedTrace]);

  // Convert POIs to monuments format
  const monuments = useMemo(() => {
    const pois: any[] = routeData?.data?.pois || [];
    if (!pois.length) return [];
    
    // Create a copy before sorting to avoid mutating immutable data
    return [...pois]
      .sort((a, b) => (a.CircuitPOI?.order || 0) - (b.CircuitPOI?.order || 0))
      .map((poi, index) => {
        const poiAny = poi as any;
        let coords = poiAny.coordinates;
        
        let lat = 0;
        let lng = 0;
        
        if (coords) {
          if (typeof coords === 'string') {
            try {
              coords = JSON.parse(coords);
            } catch (e) {
              console.warn('Failed to parse coordinates:', coords);
            }
          }
          
          if (coords && typeof coords === 'object') {
            if ('lat' in coords && 'lng' in coords) {
              lat = Number(coords.lat) || 0;
              lng = Number(coords.lng) || 0;
            } else if ('latitude' in coords && 'longitude' in coords) {
              lat = Number(coords.latitude) || 0;
              lng = Number(coords.longitude) || 0;
            } else if (coords.coordinates && Array.isArray(coords.coordinates)) {
              lng = Number(coords.coordinates[0]) || 0;
              lat = Number(coords.coordinates[1]) || 0;
            }
          }
        }
        
        const files = (poi as any).files || [];
        const imageFile = files.find((f: any) => f.type === 'image');
        const imageUrl = imageFile?.fileUrl || (poi as any).initialImage;
        
        const poiId = String(poi.id);
        
        return {
          id: poiId,
          title: poi.frLocalization?.name || poi.enLocalization?.name || poi.arLocalization?.name || 'POI',
          type: (poi as any).categoryPOI?.fr?.name || 'Point d\'intérêt',
          latitude: lat,
          longitude: lng,
          imageUrl: imageUrl,
          order: poi.CircuitPOI?.order || index + 1,
          isVisited: visitedPoiIds.has(poiId),
          isRemoved: removedPoiIds.has(poiId),
        } as Monument;
      })
      .filter(m => m.latitude !== 0 && m.longitude !== 0);
  }, [routeData, visitedPoiIds, removedPoiIds]);

  // Detect POI proximity and start visit timer
  useEffect(() => {
    if (!userLocation || !monuments.length || !id) return;

    monuments.forEach((poi) => {
      const poiId = String(poi.id);
      
      // Skip if already visited or removed
      if (poi.isVisited || poi.isRemoved) {
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

      // Calculate distance
      const R = 6371000; // Earth radius in meters
      const dLat = (poi.latitude - userLocation.latitude) * Math.PI / 180;
      const dLon = (poi.longitude - userLocation.longitude) * Math.PI / 180;
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(userLocation.latitude * Math.PI / 180) * Math.cos(poi.latitude * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      // If within proximity distance
      if (distance <= PROXIMITY_DISTANCE) {
        // Start timer if not already started
        if (!poiVisitTimersRef.current[poiId]) {
          const startTime = Date.now();
          setVisitingPoiId(poiId);
          setPoiVisitTimers(prev => ({
            ...prev,
            [poiId]: { startTime, remainingSeconds: VISIT_DURATION }
          }));

          const timer = setInterval(() => {
            setPoiVisitTimers(prev => {
              const timerData = prev[poiId];
              if (!timerData) return prev;
              
              const elapsed = Math.floor((Date.now() - timerData.startTime) / 1000);
              const remaining = Math.max(0, VISIT_DURATION - elapsed);

              if (remaining === 0) {
                // Timer finished - mark POI as visited
                clearInterval(poiVisitTimersRef.current[poiId]);
                delete poiVisitTimersRef.current[poiId];
                
                addVisitedTrace({
                  routeId: id,
                  longitude: userLocation.longitude,
                  latitude: userLocation.latitude,
                  pois: [poiId]
                }).unwrap().then(() => {
                  setVisitingPoiId(null);
                  Alert.alert('Succès', `${poi.title} marqué comme visité !`);
                  refetchRoute();
                }).catch((error: any) => {
                  console.error('Error visiting POI:', error);
                  setVisitingPoiId(null);
                });

                return { ...prev };
              }

              return {
                ...prev,
                [poiId]: { ...timerData, remainingSeconds: remaining }
              };
            });
          }, 100);

          poiVisitTimersRef.current[poiId] = timer;
        }
      } else {
        // User moved away - stop timer
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
  }, [userLocation, monuments, id, visitingPoiId, addVisitedTrace, refetchRoute]);

  const filteredPois = useMemo(() => {
    if (!searchQuery.trim()) return monuments;
    const q = searchQuery.toLowerCase();
    return monuments.filter(p => p.title.toLowerCase().includes(q));
  }, [monuments, searchQuery]);

  const defaultCoordinates = useMemo(() => initialUserLocation || {
    latitude: monuments[0]?.latitude || 34.0626,
    longitude: monuments[0]?.longitude || -5.0077,
  }, [initialUserLocation, monuments]);

  const monumentsData = useMemo(() => JSON.stringify(monuments), [monuments]);

  // Handle POI selection
  const handleSelectPoi = async (poi: Monument) => {
    setSelectedPoiId(poi.id);
    setLoadingPoi(true);
    
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
    
    try {
      const poiData = await getPOIById(poi.id);
      setSelectedPoiData(poiData);
    } catch (error) {
      console.error('Error fetching POI details:', error);
    } finally {
      setLoadingPoi(false);
    }
  };

  // Handle remove/add POI
  const handleRemovePOI = async (poiId: string) => {
    if (!id) return;
    try {
      await removePOI({ routeId: id, poiId }).unwrap();
      Alert.alert('Succès', 'POI retiré du circuit');
      refetchRoute();
    } catch (error: any) {
      console.error('Error removing POI:', error);
      Alert.alert('Erreur', error?.data?.message || 'Erreur lors du retrait du POI');
    }
  };

  const handleAddPOI = async (poiId: string) => {
    if (!id) return;
    try {
      await addPOI({ routeId: id, poiId }).unwrap();
      Alert.alert('Succès', 'POI rajouté au circuit');
      refetchRoute();
    } catch (error: any) {
      console.error('Error adding POI:', error);
      Alert.alert('Erreur', error?.data?.message || 'Erreur lors de l\'ajout du POI');
    }
  };

  // Generate map HTML (similar to circuit-detail.tsx but with visited/removed states)
  const mapHTML = useMemo(() => {
    if (!monuments.length) return '';
    
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
            .monument-marker.removed img { border: 3px solid #6b7280; opacity: 0.5; filter: grayscale(100%); }
            .monument-marker.selected img { border: 4px solid #f59e0b !important; box-shadow: 0 4px 16px rgba(245, 158, 11, 0.5); }
            .monument-marker.visiting img { border: 4px solid #3b82f6 !important; box-shadow: 0 4px 16px rgba(59, 130, 246, 0.5); animation: pulse 2s infinite; }
            @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
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

            const monuments = ${monumentsData};
            const currentLocation = ${JSON.stringify(initialUserLocation)};
            let selectedPoiId = null;
            let userLocationMarker = null;
            let monumentMarkers = {};
            let visitingPoiId = null;
            
            window.updateVisitingPoi = function(poiId) {
              visitingPoiId = poiId;
              Object.values(monumentMarkers).forEach(({element}) => {
                element.classList.remove('visiting');
              });
              if (poiId && monumentMarkers[poiId]) {
                monumentMarkers[poiId].element.classList.add('visiting');
              }
            };
            
            window.updateSelectedPoi = function(poiId) {
              selectedPoiId = poiId;
              Object.values(monumentMarkers).forEach(({element}) => {
                element.classList.remove('selected');
              });
              if (poiId && monumentMarkers[poiId]) {
                monumentMarkers[poiId].element.classList.add('selected');
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

            function addMonumentMarkers() {
                Object.values(monumentMarkers).forEach(({ marker }) => {
                    marker.remove();
                });
                monumentMarkers = {};

                monuments.forEach((monument, index) => {
                    if (!monument.longitude || !monument.latitude || 
                        monument.longitude === 0 || monument.latitude === 0) {
                        return;
                    }

                    const el = document.createElement('div');
                    el.className = 'monument-marker';
                    el.setAttribute('data-monument-id', monument.id);
                    
                    if (monument.isVisited) el.classList.add('completed');
                    else if (monument.isRemoved) el.classList.add('removed');
                    else el.classList.add('pending');
                    
                    if (selectedPoiId === monument.id) el.classList.add('selected');
                    if (visitingPoiId === monument.id) el.classList.add('visiting');
                    
                    const img = document.createElement('img');
                    img.style.width = '50px';
                    img.style.height = '50px';
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
                addMonumentMarkers();

                if (currentLocation) {
                    addUserLocationMarker(currentLocation.latitude, currentLocation.longitude);
                }

                async function updateCircuitRoute() {
                    const coordsArray = [];
                    
                    const currentLoc = currentLocation || window.lastKnownLocation;
                    if (currentLoc) {
                        coordsArray.push(currentLoc.longitude + ',' + currentLoc.latitude);
                    }
                    
                    monuments.forEach(m => {
                        if (!m.isRemoved && m.longitude && m.latitude && m.longitude !== 0 && m.latitude !== 0) {
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
                                    'line-color': '#10b981',
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
                }

                await updateCircuitRoute();
                
                window.updateMonumentMarkers = function() {
                    addMonumentMarkers();
                };
                
                window.updateCircuitRoute = updateCircuitRoute;
            });
        </script>
    </body>
    </html>
  `;
  }, [monumentsData, defaultCoordinates, initialUserLocation]);

  // Update visiting POI in map
  useEffect(() => {
    if (visitingPoiId && webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        (function() {
          if (typeof window.updateVisitingPoi === 'function') {
            window.updateVisitingPoi('${visitingPoiId}');
          }
        })();
        true;
      `);
    }
  }, [visitingPoiId]);

  // Update route when monuments change
  useEffect(() => {
    if (!monuments.length || !webViewRef.current) return;
    
    webViewRef.current.injectJavaScript(`
      (function() {
        const newMonuments = ${monumentsData};
        if (typeof monuments !== 'undefined') {
          monuments = newMonuments;
        }
        if (typeof window.updateMonumentMarkers === 'function') {
          window.updateMonumentMarkers();
        }
        if (typeof window.updateCircuitRoute === 'function') {
          window.updateCircuitRoute();
        }
      })();
      true;
    `);
  }, [monumentsData]);

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'marker_press' && data.monument) {
        handleSelectPoi(data.monument);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
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
        headerTitle="Navigation"
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </ScreenWithHeader>
    );
  }

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
          index={1}
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
              <Text style={styles.headerTitle}>Navigation du circuit</Text>
              <Text style={styles.headerSubtitle}>
                {monuments.filter(m => !m.isRemoved).length} POI{monuments.filter(m => !m.isRemoved).length > 1 ? 's' : ''} restant{monuments.filter(m => !m.isRemoved).length > 1 ? 's' : ''}
                {visitedPoiIds.size > 0 && (
                  <Text style={styles.visitedCount}> • {visitedPoiIds.size} visité{visitedPoiIds.size > 1 ? 's' : ''}</Text>
                )}
              </Text>
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
                  
                  {/* POI Name */}
                  <View style={styles.poiHeader}>
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
                  
                  {/* Media Files */}
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
                </View>
              ) : (
                <Text style={styles.errorText}>Aucune donnée disponible</Text>
              )}
            </View>
          ) : (
            <View style={styles.poiList}>
              <Text style={styles.sectionTitle}>Étapes du circuit</Text>
              
              {filteredPois.length === 0 ? (
                <Text style={styles.emptyText}>Aucun POI trouvé</Text>
              ) : (
                filteredPois.map((poi, index) => {
                  const isStart = index === 0;
                  const isEnd = index === filteredPois.length - 1;
                  const timerData = poiVisitTimers[poi.id];
                  const remainingSeconds = timerData?.remainingSeconds ?? 0;
                  
                  return (
                    <TouchableOpacity
                      key={poi.id}
                      style={[
                        styles.poiItem,
                        poi.isVisited && styles.poiItemVisited,
                        poi.isRemoved && styles.poiItemRemoved,
                      ]}
                      onPress={() => !poi.isRemoved && handleSelectPoi(poi)}
                    >
                      <View style={styles.poiImageContainer}>
                        {poi.imageUrl ? (
                          <Image source={{ uri: poi.imageUrl }} style={styles.poiThumbnail} />
                        ) : (
                          <View style={styles.poiPlaceholder}>
                            <Text style={styles.poiPlaceholderText}>POI</Text>
                          </View>
                        )}
                        {poi.isVisited && (
                          <View style={styles.visitedBadge}>
                            <CheckCircle size={16} color="#10b981" />
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
                          <Text style={[styles.poiLabel, poi.isRemoved && styles.poiLabelRemoved]} numberOfLines={1}>
                            {poi.title}
                          </Text>
                          <View style={[
                            styles.orderBadge,
                            poi.isVisited && styles.orderBadgeVisited,
                            poi.isRemoved && styles.orderBadgeRemoved,
                          ]}>
                            <Text style={styles.orderBadgeText}>
                              {poi.isVisited ? '✓' : poi.isRemoved ? '✕' : `#${index + 1}`}
                            </Text>
                          </View>
                        </View>
                        {visitingPoiId === poi.id && timerData && (
                          <Text style={styles.visitingText}>
                            Visite en cours... {remainingSeconds}s
                          </Text>
                        )}
                        {poi.isVisited && (
                          <Text style={styles.visitedText}>✓ Visité</Text>
                        )}
                        {poi.isRemoved && (
                          <Text style={styles.removedText}>Retiré</Text>
                        )}
                      </View>
                      {/* Remove/Add button */}
                      <View style={styles.poiActions}>
                        {poi.isRemoved ? (
                          <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => handleAddPOI(poi.id)}
                          >
                            <Plus size={16} color="#10b981" />
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            style={styles.removeButton}
                            onPress={() => handleRemovePOI(poi.id)}
                          >
                            <X size={16} color="#ef4444" />
                          </TouchableOpacity>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          )}
          </BottomSheetScrollView>
        </BottomSheet>
        
        {/* Media Viewer Modal */}
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  visitedCount: {
    color: '#10b981',
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
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 20,
  },
  poiItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  poiItemVisited: {
    backgroundColor: '#f0fdf4',
    borderColor: '#10b981',
  },
  poiItemRemoved: {
    backgroundColor: '#f9fafb',
    opacity: 0.6,
  },
  poiImageContainer: {
    position: 'relative',
    marginRight: 12,
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
  visitedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 2,
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
    marginBottom: 4,
  },
  poiLabel: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  poiLabelRemoved: {
    textDecorationLine: 'line-through',
    color: '#6b7280',
  },
  orderBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  orderBadgeVisited: {
    backgroundColor: '#d1fae5',
  },
  orderBadgeRemoved: {
    backgroundColor: '#f3f4f6',
  },
  orderBadgeText: {
    fontSize: 11,
    color: '#3b82f6',
    fontWeight: '600',
  },
  visitingText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600',
    marginTop: 4,
  },
  visitedText: {
    fontSize: 12,
    color: '#10b981',
    marginTop: 4,
  },
  removedText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  poiActions: {
    justifyContent: 'center',
    marginLeft: 8,
  },
  removeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
  },
  addButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0fdf4',
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
  poiHeader: {
    marginBottom: 12,
  },
  poiName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  poiDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
    marginBottom: 16,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 12,
  },
  mediaItem: {
    width: (width - 64) / 3,
    aspectRatio: 16 / 9,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 8,
    marginBottom: 8,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#64748b',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
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
});

