import { useRef } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

interface Monument {
  id: number;
  latitude: number;
  longitude: number;
  title: string;
  type: string;
}

interface MapViewerProps {
  monuments?: Monument[];
  maptilerApiKey?: string; // Optional: defaults to the key in styleUrl
  styleUrl?: string; // Optional: custom MapTiler style URL
}

const { height } = Dimensions.get('window');

const LOCATIONS: Monument[] = [
  {
    id: 1,
    latitude: 34.0626,
    longitude: -5.0077,
    title: 'Fez Medina',
    type: 'landmark',
  },
  {
    id: 2,
    latitude: 34.0656,
    longitude: -5.0087,
    title: 'Restaurant',
    type: 'restaurant',
  },
  {
    id: 3,
    latitude: 34.0596,
    longitude: -5.0067,
    title: 'Museum',
    type: 'museum',
  },
  {
    id: 4,
    latitude: 34.0646,
    longitude: -5.0047,
    title: 'Café',
    type: 'coffee',
  },
  { id: 5, latitude: 34.0616, longitude: -5.0107, title: 'Shop', type: 'shop' },
];

export default function WebMapViewer({
  monuments = LOCATIONS,
  maptilerApiKey = 'cKuGgc1qdSgluaz2JWLK',
  styleUrl = 'https://api.maptiler.com/maps/019a213d-06f4-7ef2-be61-48b4b8fb7e56/style.json?key=cKuGgc1qdSgluaz2JWLK',
}: MapViewerProps) {
  const webViewRef = useRef<WebView>(null);

  const defaultCoordinates = {
    latitude: 34.0626,
    longitude: -5.0077,
  };

  // Generate monument markers data for the map
  const monumentsData = JSON.stringify(monuments);

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
            }
            #map { 
                width: 100%; 
                height: 100vh; 
            }
            .monument-marker {
                cursor: pointer;
                font-size: 32px;
            }
            .maplibregl-popup-content {
                font-family: Arial, sans-serif;
                padding: 12px;
            }
            .monument-popup .title {
                font-weight: bold;
                font-size: 14px;
                margin-bottom: 4px;
                color: #1e293b;
            }
            .monument-popup .type {
                font-size: 12px;
                color: #64748b;
                text-transform: capitalize;
            }
            .user-pin {
                width: 30px;
                height: 30px;
                background: #ef4444;
                border: 3px solid white;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                cursor: pointer;
            }
            .user-pin-inner {
                width: 10px;
                height: 10px;
                background: white;
                border-radius: 50%;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
            .path-info {
                position: absolute;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: white;
                padding: 12px 20px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                z-index: 1000;
                font-family: Arial, sans-serif;
                font-size: 14px;
                display: none;
            }
            .path-info.active {
                display: block;
            }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <div id="pathInfo" class="path-info"></div>
        <script>
            const map = new maplibregl.Map({
                container: 'map',
                style: '${styleUrl}',
                center: [${defaultCoordinates.longitude}, ${defaultCoordinates.latitude}],
                zoom: 14
            });
            
            const monuments = ${monumentsData};
            
            // Icon mapping for different monument types
            const iconMap = {
                'landmark': '🏛️',
                'restaurant': '🍽️',
                'museum': '🏛️',
                'coffee': '☕',
                'shop': '🛍️',
                'default': '📍'
            };
            
            // Add monument markers
            monuments.forEach(monument => {
                const icon = iconMap[monument.type] || iconMap['default'];
                
                const el = document.createElement('div');
                el.className = 'monument-marker';
                el.innerHTML = icon;
                
                const popup = new maplibregl.Popup({ offset: 25 })
                    .setHTML(
                        '<div class="monument-popup">' +
                        '<div class="title">' + monument.title + '</div>' +
                        '<div class="type">' + monument.type + '</div>' +
                        '</div>'
                    );
                
                new maplibregl.Marker({ element: el })
                    .setLngLat([monument.longitude, monument.latitude])
                    .setPopup(popup)
                    .addTo(map);
            });
            
            // User pins and path functionality
            let userPins = [];
            let userMarkers = [];
            let pathSourceId = 'path-source';
            let pathLayerId = 'path-layer';
            
            // Add path source and layer
            map.on('load', function() {
                map.addSource(pathSourceId, {
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
                    id: pathLayerId,
                    type: 'line',
                    source: pathSourceId,
                    layout: {
                        'line-join': 'round',
                        'line-cap': 'round'
                    },
                    paint: {
                        'line-color': '#3b82f6',
                        'line-width': 4,
                        'line-opacity': 0.7,
                        'line-dasharray': [2, 2]
                    }
                });
            });
            
            // Handle map clicks for pinning
            map.on('click', function(e) {
                const lng = e.lngLat.lng;
                const lat = e.lngLat.lat;
                
                // Create user pin element
                const pinEl = document.createElement('div');
                pinEl.innerHTML = '<div class="user-pin"><div class="user-pin-inner"></div></div>';
                
                // Add user pin marker
                const pinMarker = new maplibregl.Marker({ element: pinEl })
                    .setLngLat([lng, lat])
                    .addTo(map);
                
                userPins.push({ lng, lat });
                userMarkers.push(pinMarker);
                
                // If we have 2 pins, create a path
                if (userPins.length === 2) {
                    // Update path
                    const coordinates = [
                        [userPins[0].lng, userPins[0].lat],
                        [userPins[1].lng, userPins[1].lat]
                    ];
                    
                    map.getSource(pathSourceId).setData({
                        type: 'Feature',
                        geometry: {
                            type: 'LineString',
                            coordinates: coordinates
                        }
                    });
                    
                    // Calculate distance (Haversine formula)
                    const R = 6371; // Earth's radius in km
                    const lat1 = userPins[0].lat * Math.PI / 180;
                    const lat2 = userPins[1].lat * Math.PI / 180;
                    const dLat = (userPins[1].lat - userPins[0].lat) * Math.PI / 180;
                    const dLng = (userPins[1].lng - userPins[0].lng) * Math.PI / 180;
                    
                    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                            Math.cos(lat1) * Math.cos(lat2) *
                            Math.sin(dLng/2) * Math.sin(dLng/2);
                    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                    const distance = (R * c).toFixed(2);
                    
                    // Show path info
                    const pathInfo = document.getElementById('pathInfo');
                    pathInfo.innerHTML = '📍 Path created: ' + distance + ' km';
                    pathInfo.className = 'path-info active';
                    
                    // Fit bounds to show the path
                    const bounds = new maplibregl.LngLatBounds();
                    bounds.extend([userPins[0].lng, userPins[0].lat]);
                    bounds.extend([userPins[1].lng, userPins[1].lat]);
                    map.fitBounds(bounds, { padding: 50 });
                }
                
                // If we have more than 2 pins, reset
                if (userPins.length > 2) {
                    // Clear all user markers and path
                    userMarkers.forEach(marker => marker.remove());
                    
                    // Clear path
                    map.getSource(pathSourceId).setData({
                        type: 'Feature',
                        geometry: {
                            type: 'LineString',
                            coordinates: []
                        }
                    });
                    
                    userPins = [];
                    userMarkers = [];
                    
                    // Hide path info
                    const pathInfo = document.getElementById('pathInfo');
                    pathInfo.className = 'path-info';
                    
                    // Add the current pin as the first one
                    const newPinEl = document.createElement('div');
                    newPinEl.innerHTML = '<div class="user-pin"><div class="user-pin-inner"></div></div>';
                    
                    const newPinMarker = new maplibregl.Marker({ element: newPinEl })
                        .setLngLat([lng, lat])
                        .addTo(map);
                    
                    userPins.push({ lng, lat });
                    userMarkers.push(newPinMarker);
                }
                
                // Send message to React Native
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'pin_added',
                        latitude: lat,
                        longitude: lng,
                        totalPins: userPins.length
                    }));
                }
            });
            
            // Add current location if available
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    
                    const locationEl = document.createElement('div');
                    locationEl.style.fontSize = '24px';
                    locationEl.innerHTML = '📍';
                    
                    new maplibregl.Marker({ element: locationEl })
                        .setLngLat([lng, lat])
                        .setPopup(new maplibregl.Popup().setHTML('Your Location'))
                        .addTo(map);
                }, function(error) {
                    console.log('Geolocation error:', error);
                });
            }
        </script>
    </body>
    </html>
  `;

  return mapHTML;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  mapLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  mapLoadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#64748b',
  },
});
