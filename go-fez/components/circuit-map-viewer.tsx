import { useCurrentLocation } from '@/hooks/use-current-location';
import Monument from '@/types/monument';
import React, { useRef, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
} from 'react-native';
import { WebView } from 'react-native-webview';

interface MapViewerProps {
  monuments?: Monument[];
  maptilerApiKey?: string;
  styleUrl?: string;
  showUserLocation?: boolean;
  showCircuitRoute?: boolean; // blue dashed line connecting all POIs
  showUserRoute?: boolean; // Blue solid line from user to current POI
  currentPoiIndex?: number;
  completedPoiIds?: string[];
  onMarkerPress?: (monument: Monument) => void;
  onPathCalculated?: (distance: number, duration: number) => void;
}

const { height, width } = Dimensions.get('window');

export default function CircuitMapViewer({
  monuments = [],
  maptilerApiKey = 'cKuGgc1qdSgluaz2JWLK',
  styleUrl = 'https://api.maptiler.com/maps/019a213d-06f4-7ef2-be61-48b4b8fb7e56/style.json?key=cKuGgc1qdSgluaz2JWLK',
  showUserLocation = true,
  showCircuitRoute = true,
  showUserRoute = true,
  currentPoiIndex = 0,
  completedPoiIds = [],
  onMarkerPress,
  onPathCalculated,
}: MapViewerProps) {
  const webViewRef = useRef<WebView>(null);
  const { location: currentLocation, error, loading } = useCurrentLocation();
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Sort monuments by order
  const sortedMonuments = [...monuments].sort(
    (a, b) => (a.order || 0) - (b.order || 0)
  );

  // Mark monuments as current or completed
  const processedMonuments = sortedMonuments.map((monument, index) => ({
    ...monument,
    isCurrent: index === currentPoiIndex,
    isCompleted: completedPoiIds.includes(String(monument.id)),
  }));

  const currentPoi = processedMonuments[currentPoiIndex];

  const defaultCoordinates = currentLocation || {
    latitude: sortedMonuments[0]?.latitude || 34.0626,
    longitude: sortedMonuments[0]?.longitude || -5.0077,
  };

  // Generate monument markers data for the map
  const monumentsData = JSON.stringify(processedMonuments);
  const currentPoiData = JSON.stringify(currentPoi || null);

  const mapHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js"></script>
        <link href="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css" rel="stylesheet" />
        <style>
            body { 
                margin: 0; 
                padding: 0; 
                overflow: hidden;
            }
            #map { 
                width: 100vw; 
                height: 100vh; 
            }
            .monument-marker {
                cursor: pointer;
                // transition: transform 0.3s ease;
            }
            .monument-marker.current {
                z-index: 1000 !important;
            }
            @keyframes pulse {
                0%, 100% { scale: 1; }
                50% { scale: 1.15; }
            }
            .monument-marker.current img{
                animation: pulse 2s infinite;
                border-color: orange !important;
            }
            .monument-marker img {
                border-radius: 50%;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            }
            .monument-marker.completed img {
                border: 3px solid #10b981;
            }
         
            .monument-marker.pending img {
                border: 3px solid #9ca3af;
            }
            .maplibregl-popup-content {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                padding: 12px;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            }
            .monument-popup .title {
                font-weight: 700;
                font-size: 15px;
                margin-bottom: 6px;
                color: #1e293b;
            }
            .monument-popup .type {
                font-size: 12px;
                color: #64748b;
                text-transform: capitalize;
                margin-bottom: 4px;
            }
            .monument-popup .status {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 600;
                margin-top: 4px;
            }
            .monument-popup .status.current {
                background: #fee2e2;
                color: #dc2626;
            }
            .monument-popup .status.completed {
                background: #d1fae5;
                color: #059669;
            }
            .monument-popup .order {
                font-size: 11px;
                color: #94a3b8;
                margin-top: 4px;
            }
            .user-location-marker {
                width: 40px;
                height: 40px;
                position: relative;
            }
            .user-location-pulse {
                position: absolute;
                width: 40px;
                height: 40px;
                background: rgba(59, 130, 246, 0.3);
                border-radius: 50%;
                animation: locationPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
            @keyframes locationPulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.5); opacity: 0; }
            }
            .user-location-dot {
                position: absolute;
                top: 8px;
                left: 8px;
                width: 24px;
                height: 24px;
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.6);
            }
            .user-location-center {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 8px;
                height: 8px;
                background: white;
                border-radius: 50%;
            }
            .route-info {
                position: absolute;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: white;
                padding: 12px 20px;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                z-index: 1000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 13px;
                font-weight: 600;
                display: none;
                max-width: 90%;
            }
            .route-info.active {
                display: block;
            }
            .route-info .distance {
                color: #3b82f6;
                font-size: 16px;
            }
            .route-info .duration {
                color: #64748b;
                font-size: 12px;
                margin-top: 2px;
            }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <div id="routeInfo" class="route-info"></div>
        <script>
            const map = new maplibregl.Map({
                container: 'map',
                style: '${styleUrl}',
                center: [${defaultCoordinates.longitude}, ${defaultCoordinates.latitude}],
                zoom: 15,
                pitch: 0,
                bearing: 0
            });

            // Add navigation controls
            map.addControl(new maplibregl.NavigationControl(), 'top-right');

            const monuments = ${monumentsData};
            const currentPoi = ${currentPoiData};
            const showUserLocation = ${showUserLocation};
            const currentLocation = ${JSON.stringify(currentLocation)};
            const showCircuitRoute = ${showCircuitRoute};
            const showUserRoute = ${showUserRoute};

            let userLocationMarker = null;
            let userAccuracyCircle = null;

            // Function to get marker color based on status
            function getMarkerColor(monument) {
                if (monument.isCurrent) return '#ef4444'; // Red for current
                if (monument.isCompleted) return '#10b981'; // Green for completed
                return '#9ca3af'; // Gray for pending
            }

            // Function to get marker size based on status
            function getMarkerSize(monument) {
                if (monument.isCurrent) return 50; // Larger for current
                if (monument.isCompleted) return 40;
                return 35;
            }

            // Add monument markers
            monuments.forEach((monument, index) => {
                const size = getMarkerSize(monument);
                
                const el = document.createElement('div');
                el.className = 'monument-marker';
                if (monument.isCurrent) el.classList.add('current');
                if (monument.isCompleted) el.classList.add('completed');
                if (!monument.isCurrent && !monument.isCompleted) el.classList.add('pending');
                
                const img = document.createElement('img');
                img.style.width = size + 'px';
                img.style.height = size + 'px';
                img.style.objectFit = 'cover';
                img.src = monument.imageUrl || 'https://via.placeholder.com/50';
                img.onerror = function() {
                    this.src = 'https://via.placeholder.com/50/cccccc/666666?text=POI';
                };
                
                el.appendChild(img);

                const statusLabel = monument.isCurrent ? 'Current' : 
                                  monument.isCompleted ? 'Visited ✓' : 
                                  'Pending';
                const statusClass = monument.isCurrent ? 'current' : 
                                   monument.isCompleted ? 'completed' : '';

                const popup = new maplibregl.Popup({ 
                    offset: 25,
                    closeButton: false,
                    maxWidth: '250px'
                })
                .setHTML(
                    '<div class="monument-popup">' +
                    '<div class="title">' + monument.title + '</div>' +
                    '<div class="type">' + monument.type + '</div>' +
                    '<div class="status ' + statusClass + '">' + statusLabel + '</div>' +
                    '<div class="order">Step ' + (index + 1) + ' of ' + monuments.length + '</div>' +
                    '</div>'
                );

                const marker = new maplibregl.Marker({ 
                    element: el,
                    anchor: 'center'
                })
                .setLngLat([monument.longitude, monument.latitude])
                .addTo(map);

                // Send marker press event to React Native
                el.addEventListener('click', () => {
                    if (window.ReactNativeWebView) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'marker_press',
                            monument: monument
                        }));
                    }
                });
            });

            // Function to add user location marker
            function addUserLocationMarker(lat, lng, accuracy) {
                // Remove existing marker if any
                if (userLocationMarker) {
                    userLocationMarker.remove();
                }
                if (userAccuracyCircle) {
                    map.removeLayer('user-accuracy-circle-fill');
                    map.removeLayer('user-accuracy-circle-outline');
                    map.removeSource('user-accuracy-circle');
                }

                // Create user location marker
                const el = document.createElement('div');
                el.className = 'user-location-marker';
                el.innerHTML = 
                    '<div class="user-location-pulse"></div>' +
                    '<div class="user-location-dot">' +
                    '<div class="user-location-center"></div>' +
                    '</div>';

                userLocationMarker = new maplibregl.Marker({ 
                    element: el,
                    anchor: 'center'
                })
                .setLngLat([lng, lat])
                .setPopup(new maplibregl.Popup().setHTML(
                    '<div style="padding: 8px; text-align: center;">' +
                    '<div style="font-weight: 700; margin-bottom: 4px;">📍 You are here</div>' +
                    '<div style="font-size: 11px; color: #64748b;">Accuracy: ±' + Math.round(accuracy) + 'm</div>' +
                    '</div>'
                ))
                .addTo(map);

                // Add accuracy circle
                const circleCoords = [];
                const numPoints = 64;
                for (let i = 0; i < numPoints; i++) {
                    const angle = (i / numPoints) * 2 * Math.PI;
                    const dx = accuracy * Math.cos(angle) / 111320; // Convert meters to degrees
                    const dy = accuracy * Math.sin(angle) / (111320 * Math.cos(lat * Math.PI / 180));
                    circleCoords.push([lng + dx, lat + dy]);
                }
                circleCoords.push(circleCoords[0]); // Close the polygon

                map.addSource('user-accuracy-circle', {
                    type: 'geojson',
                    data: {
                        type: 'Feature',
                        geometry: {
                            type: 'Polygon',
                            coordinates: [circleCoords]
                        }
                    }
                });

                map.addLayer({
                    id: 'user-accuracy-circle-fill',
                    type: 'fill',
                    source: 'user-accuracy-circle',
                    paint: {
                        'fill-color': '#3b82f6',
                        'fill-opacity': 0.15
                    }
                });

                map.addLayer({
                    id: 'user-accuracy-circle-outline',
                    type: 'line',
                    source: 'user-accuracy-circle',
                    paint: {
                        'line-color': '#3b82f6',
                        'line-width': 2,
                        'line-opacity': 0.5,
                        'line-dasharray': [2, 2]
                    }
                });
            }

            // Watch user location
            if (showUserLocation && currentLocation) {
                const position = currentLocation;
                const lat = position.latitude;
                const lng = position.longitude;
                const accuracy = position.accuracy || 50;
                
                addUserLocationMarker(lat, lng, accuracy);
                
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'location_update',
                        latitude: lat,
                        longitude: lng,
                        accuracy: accuracy
                    }));
                }
                    
                
            }

            // Function to fetch route from OSRM
            async function fetchRoute(coordinates, profile = 'foot') {
                const coords = coordinates.map(c => c[0] + ',' + c[1]).join(';');
                const url = 'https://router.project-osrm.org/route/v1/' + profile + '/' + coords + '?overview=full&geometries=geojson';
                
                try {
                    const response = await fetch(url);
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

            // Function to fetch circular trip route using OSRM Trip service
            async function fetchCircuitTrip(coordinates, profile = 'foot') {
                const coords = coordinates.map(c => c[0] + ',' + c[1]).join(';');
                // Use OSRM Trip service for optimal circular route
                const url = 'https://router.project-osrm.org/trip/v1/' + profile + '/' + coords + '?overview=full&geometries=geojson&source=first&destination=last&roundtrip=false';
                
                try {
                    const response = await fetch(url);
                    const data = await response.json();
                    
                    if (data.code === 'Ok' && data.trips && data.trips.length > 0) {
                        return data.trips[0];
                    }
                    return null;
                } catch (error) {
                    console.error('Circuit trip fetch error:', error);
                    return null;
                }
            }

            // Add circuit route (blue line connecting all POIs in a circuit)
            map.on('load', async function() {
                if (showCircuitRoute && monuments.length >= 2) {
                    const coordinates = monuments.map(m => [m.longitude, m.latitude]);
                    
                    // Try using Trip service for better circuit routing
                    let route = await fetchCircuitTrip(coordinates, 'foot');
                    
                    // Fallback to regular route if trip service fails
                    if (!route) {
                        route = await fetchRoute(coordinates, 'foot');
                    }
                    
                    if (route) {
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
                                'line-color': '#036b03ff',
                                'line-width': 4
                            }
                        });

                    }
                }

                // Add user to current POI route (blue solid line)
                if (showUserRoute && currentPoi) {
                    // This will be updated when user location is available
                    map.addSource('user-route', {
                        type: 'geojson',
                        data: {
                            type: 'Feature',
                            geometry: {
                                type: 'LineString',
                                coordinates: []
                            }
                        }
                    });

                    map.addLayer({
                        id: 'user-route-layer',
                        type: 'line',
                        source: 'user-route',
                        paint: {
                            'line-color': '#ee9b00ff',
                            'line-width': 6,
                            'line-opacity': 0.9
                        }
                    });
                }
            });

            // Function to update user route
            async function updateUserRoute(userLat, userLng) {
                if (!showUserRoute || !currentPoi || !map.getSource('user-route')) return;

                const coordinates = [
                    [userLng, userLat],
                    [currentPoi.longitude, currentPoi.latitude]
                ];

                const route = await fetchRoute(coordinates, 'foot');
                
                if (route) {
                    map.getSource('user-route').setData({
                        type: 'Feature',
                        geometry: route.geometry
                    });

                    // Show route info
                    const routeInfo = document.getElementById('routeInfo');
                    const distance = (route.distance / 1000).toFixed(2);
                    const duration = Math.round(route.duration / 60);
                    
                    routeInfo.innerHTML = 
                        '<div class="distance">📍 ' + distance + ' km</div>' +
                        '<div class="duration">⏱️ ~' + duration + ' min walk</div>';
                    routeInfo.classList.add('active');

                    // Send route data to React Native
                    if (window.ReactNativeWebView) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'route_calculated',
                            distance: route.distance,
                            duration: route.duration
                        }));
                    }

                    // Fit map to show route
                    const bounds = new maplibregl.LngLatBounds();
                    route.geometry.coordinates.forEach(coord => bounds.extend(coord));
                    map.fitBounds(bounds, { padding: 80, maxZoom: 16 });
                }
            }

            // Listen for user location updates to update route
            if (showUserLocation && navigator.geolocation) {
                navigator.geolocation.watchPosition(
                    function(position) {
                        updateUserRoute(position.coords.latitude, position.coords.longitude);
                    },
                    null,
                    { enableHighAccuracy: true, maximumAge: 10000 }
                );
            }

            // Center map on current POI
            if (currentPoi) {
                setTimeout(() => {
                    map.flyTo({
                        center: [currentPoi.longitude, currentPoi.latitude],
                        zoom: 16,
                        duration: 1500,
                        essential: true
                    });
                }, 500);
            }
        </script>
    </body>
    </html>
  `;

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      switch (data.type) {
        case 'marker_press':
          if (onMarkerPress && data.monument) {
            onMarkerPress(data.monument);
          }
          break;
        case 'location_update':
          setUserLocation({ lat: data.latitude, lng: data.longitude });
          break;
        case 'route_calculated':
          if (onPathCalculated) {
            onPathCalculated(data.distance, data.duration);
          }
          break;
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: mapHTML }}
        style={styles.map}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        geolocationEnabled={true}
        startInLoadingState={true}
        onMessage={handleWebViewMessage}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size='large' color='#3b82f6' />
            <Text style={styles.loadingText}>Loading map...</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
});
