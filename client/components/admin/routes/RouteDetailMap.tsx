"use client";

import React, { useEffect, useRef, useState } from 'react';
import Map, { Marker, Source, Layer, Popup } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, Navigation, XCircle, CheckCircle, Clock } from 'lucide-react';

const MAP_STYLE = 'https://api.maptiler.com/maps/019a213d-06f4-7ef2-be61-48b4b8fb7e56/style.json?key=cKuGgc1qdSgluaz2JWLK';

interface POI {
  id: string;
  latitude: number;
  longitude: number;
  frLocalization?: { name?: string };
  enLocalization?: { name?: string };
  arLocalization?: { name?: string };
  initialImage?: string;
}

interface VisitedTrace {
  id: string;
  latitude: number;
  longitude: number;
  poiId?: string;
  createdAt: string;
}

interface RouteDetailMapProps {
  visitedTraces: VisitedTrace[];
  visitedPois: POI[];
  removedPois: POI[];
  remainingPois: POI[];
  currentLocation: {
    latitude: number;
    longitude: number;
    timestamp: string;
  } | null;
}

export default function RouteDetailMap({
  visitedTraces,
  visitedPois,
  removedPois,
  remainingPois,
  currentLocation
}: RouteDetailMapProps) {
  const mapRef = useRef<any>(null);
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);
  const [viewState, setViewState] = useState({
    latitude: 34.0331,
    longitude: -4.9998,
    zoom: 13
  });

  // Debug logging
  useEffect(() => {
    console.log('🗺️ RouteDetailMap received data:', {
      visitedPois: visitedPois.length,
      removedPois: removedPois.length,
      remainingPois: remainingPois.length,
      visitedTraces: visitedTraces.length,
      hasCurrentLocation: !!currentLocation
    });
    
    // Log removed POIs specifically
    removedPois.forEach(poi => {
      console.log('🗑️ Removed POI for map:', {
        id: poi.id,
        latitude: poi.latitude,
        longitude: poi.longitude,
        name: poi.frLocalization?.name || poi.enLocalization?.name,
        hasValidCoords: !isNaN(poi.latitude) && !isNaN(poi.longitude)
      });
    });
  }, [visitedPois, removedPois, remainingPois, visitedTraces, currentLocation]);

  // Calculate map center and zoom based on traces
  useEffect(() => {
    if (visitedTraces.length > 0) {
      const lats = visitedTraces.map(t => t.latitude);
      const lngs = visitedTraces.map(t => t.longitude);
      
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      
      const centerLat = (minLat + maxLat) / 2;
      const centerLng = (minLng + maxLng) / 2;
      
      setViewState({
        latitude: centerLat,
        longitude: centerLng,
        zoom: 13
      });
    }
  }, [visitedTraces]);

  // Create path GeoJSON from visited traces
  const pathGeoJSON: any = React.useMemo(() => {
    if (visitedTraces.length < 2) return null;
    
    return {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: visitedTraces.map(t => [t.longitude, t.latitude])
      }
    };
  }, [visitedTraces]);

  const getPOIName = (poi: POI) => {
    return poi.frLocalization?.name || poi.enLocalization?.name || poi.arLocalization?.name || 'POI';
  };

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-gray-200">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle={MAP_STYLE}
      >
        {/* Path line from visited traces */}
        {pathGeoJSON && (
          <Source id="route-path" type="geojson" data={pathGeoJSON}>
            <Layer
              id="route-line"
              type="line"
              paint={{
                'line-color': '#007036',
                'line-width': 4,
                'line-opacity': 0.8
              }}
            />
          </Source>
        )}

        {/* Visited POIs (Green markers) */}
        {visitedPois.filter(poi => 
          typeof poi.latitude === 'number' && 
          typeof poi.longitude === 'number' && 
          !isNaN(poi.latitude) && 
          !isNaN(poi.longitude)
        ).map((poi) => (
          <Marker
            key={`visited-${poi.id}`}
            latitude={poi.latitude}
            longitude={poi.longitude}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelectedPoi(poi);
            }}
          >
            <div className="relative cursor-pointer group">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-green-600 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                {getPOIName(poi)}
              </div>
              <div className="bg-green-600 rounded-full p-2 shadow-lg border-2 border-white">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            </div>
          </Marker>
        ))}

        {/* Removed POIs (Red/Grey markers) */}
        {removedPois.filter(poi => 
          typeof poi.latitude === 'number' && 
          typeof poi.longitude === 'number' && 
          !isNaN(poi.latitude) && 
          !isNaN(poi.longitude)
        ).map((poi) => (
          <Marker
            key={`removed-${poi.id}`}
            latitude={poi.latitude}
            longitude={poi.longitude}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelectedPoi(poi);
            }}
          >
            <div className="relative cursor-pointer group">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-red-600 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                {getPOIName(poi)}
              </div>
              <div className="bg-red-600 rounded-full p-2 shadow-lg border-2 border-white">
                <XCircle className="w-5 h-5 text-white" />
              </div>
            </div>
          </Marker>
        ))}

        {/* Remaining POIs (Default markers) */}
        {remainingPois.filter(poi => 
          typeof poi.latitude === 'number' && 
          typeof poi.longitude === 'number' && 
          !isNaN(poi.latitude) && 
          !isNaN(poi.longitude)
        ).map((poi) => (
          <Marker
            key={`remaining-${poi.id}`}
            latitude={poi.latitude}
            longitude={poi.longitude}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelectedPoi(poi);
            }}
          >
            <div className="relative cursor-pointer group">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-700 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                {getPOIName(poi)}
              </div>
              <div className="bg-gray-400 rounded-full p-2 shadow-lg border-2 border-white">
                <Clock className="w-5 h-5 text-white" />
              </div>
            </div>
          </Marker>
        ))}

        {/* Current Location (User position - most recent trace) */}
        {currentLocation && (
          <Marker
            latitude={currentLocation.latitude}
            longitude={currentLocation.longitude}
            anchor="center"
          >
            <div className="relative">
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                Current Location
              </div>
              <div className="bg-blue-600 rounded-full p-3 shadow-xl border-4 border-white animate-pulse">
                <Navigation className="w-6 h-6 text-white" />
              </div>
            </div>
          </Marker>
        )}

        {/* POI Detail Popup */}
        {selectedPoi && (
          <Popup
            latitude={selectedPoi.latitude}
            longitude={selectedPoi.longitude}
            anchor="top"
            onClose={() => setSelectedPoi(null)}
            closeButton={true}
            closeOnClick={false}
          >
            <div className="p-2 min-w-[200px]">
              {selectedPoi.initialImage && (
                <img
                  src={selectedPoi.initialImage}
                  alt={getPOIName(selectedPoi)}
                  className="w-full h-32 object-cover rounded mb-2"
                />
              )}
              <h3 className="font-semibold text-sm mb-1">{getPOIName(selectedPoi)}</h3>
              <p className="text-xs text-gray-600">
                {selectedPoi.latitude.toFixed(6)}, {selectedPoi.longitude.toFixed(6)}
              </p>
            </div>
          </Popup>
        )}
      </Map>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 text-xs max-w-[220px]">
        <div className="font-semibold mb-3 text-sm text-gray-900">Legend</div>
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 border-2 border-white rounded-full p-1.5 shadow-sm">
              <Navigation className="w-4 h-4 text-white" />
            </div>
            <span className="text-gray-700">Current Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-green-600 border-2 border-white rounded-full p-1.5 shadow-sm">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <span className="text-gray-700">Visited POI</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-red-600 border-2 border-white rounded-full p-1.5 shadow-sm">
              <XCircle className="w-4 h-4 text-white" />
            </div>
            <span className="text-gray-700">Removed POI</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-gray-400 border-2 border-white rounded-full p-1.5 shadow-sm">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <span className="text-gray-700">Remaining POI</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <div className="w-4 h-2 bg-black rounded-sm"></div>
              <div className="w-4 h-1 bg-[#007036] -ml-2"></div>
            </div>
            <span className="text-gray-700">User Path</span>
          </div>
        </div>
      </div>
    </div>
  );
}
