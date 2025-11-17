"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetRouteByIdQuery } from '@/services/api/RouteApi';
import { MapPin, Clock, Route as RouteIcon, Award, Calendar, Car, Bike, User as WalkIcon, Loader2, CheckCircle, XCircle, CircleDot, ArrowLeft } from 'lucide-react';
import Map, { Marker, Source, Layer } from 'react-map-gl/maplibre';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const MAP_STYLE = 'https://api.maptiler.com/maps/019a213d-06f4-7ef2-be61-48b4b8fb7e56/style.json?key=cKuGgc1qdSgluaz2JWLK';

export default function RouteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const routeId = params.id as string;
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const { data, isLoading, error } = useGetRouteByIdQuery(routeId);
  const routeData = data?.data;
  const route = routeData?.route;
  const visitedTraces = routeData?.visitedTraces || [];
  const removedTraces = routeData?.removedTraces || [];
  const pois = routeData?.pois || [];

  // Debug logging
  React.useEffect(() => {
    if (routeData) {
      console.log('🗺️ User Route Detail Data:', {
        routeId,
        visitedTraces: visitedTraces.length,
        removedTraces: removedTraces.length,
        pois: pois.length,
        isCircuitRoute: route?.circuitId !== null
      });
      console.log('Visited Traces:', visitedTraces);
      console.log('Removed Traces:', removedTraces);
      console.log('POIs:', pois);
    }
  }, [routeData, routeId, visitedTraces, removedTraces, pois, route]);

  const getTransportIcon = (mode: string) => {
    switch (mode) {
      case 'car':
      case 'motorcycle':
        return <Car className="w-5 h-5" />;
      case 'bike':
        return <Bike className="w-5 h-5" />;
      case 'foot':
        return <WalkIcon className="w-5 h-5" />;
      default:
        return <WalkIcon className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#007036]" />
          <span className="text-lg">Loading route details...</span>
        </div>
      </div>
    );
  }

  if (error || !route) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">Failed to load route details</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-[#007036] text-white rounded-lg hover:bg-[#005a2b]"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Prepare map data
  const isCircuitRoute = route.circuitId !== null;
  
  // For navigation routes (single POI), show the destination POI
  let destinationPoi: any = null;
  if (!isCircuitRoute && pois.length > 0) {
    // For navigation routes, pois array contains the target POI
    destinationPoi = pois[0];
    console.log('🎯 Navigation route destination POI:', {
      poi: destinationPoi,
      hasCoordinates: !!(destinationPoi.latitude && destinationPoi.longitude),
      lat: destinationPoi.latitude,
      lng: destinationPoi.longitude,
      name: destinationPoi.frLocalization?.name || destinationPoi.enLocalization?.name,
      isCircuitRoute,
      poisLength: pois.length
    });
  } else {
    console.log('🎯 No destination POI:', { isCircuitRoute, poisLength: pois.length });
  }
  
  // For visited traces, get unique POI IDs that were visited
  const uniqueVisitedPoiIds = [...new Set(visitedTraces
    .filter((vt: any) => vt.poiId)
    .map((vt: any) => vt.poiId))];

  // Get all circuit POIs if circuit-based route (pois from backend)
  const allCircuitPois = pois;
  
  // Match visited POI IDs with circuit POIs to get full POI data with coordinates
  const visitedPois = uniqueVisitedPoiIds
    .map(poiId => allCircuitPois.find((p: any) => p.id === poiId))
    .filter((poi: any) => poi && poi.latitude && poi.longitude && !isNaN(poi.latitude) && !isNaN(poi.longitude));
  
  // Match removed traces with circuit POIs to get coordinates
  const removedPois = removedTraces
    .map((rt: any) => {
      const circuitPoi = allCircuitPois.find((p: any) => p.id === rt.poiId);
      return circuitPoi ? {
        ...circuitPoi,
        removedTraceId: rt.id,
        removedAt: rt.createdAt
      } : null;
    })
    .filter((poi: any) => poi && poi.latitude && poi.longitude && !isNaN(poi.latitude) && !isNaN(poi.longitude));

  const visitedPoiIds = visitedPois.map((vp: any) => vp.id);
  const removedPoiIds = removedPois.map((rp: any) => rp.id);
  
  const remainingPois = allCircuitPois
    .filter((poi: any) => !visitedPoiIds.includes(poi.id) && !removedPoiIds.includes(poi.id))
    .filter((poi: any) => poi.latitude && poi.longitude && !isNaN(poi.latitude) && !isNaN(poi.longitude));

  console.log('📍 Map markers:', {
    visitedPois: visitedPois.length,
    removedPois: removedPois.length,
    remainingPois: remainingPois.length,
    tracePath: visitedTraces.length,
    allCircuitPois: allCircuitPois.length,
    visitedPoiIds,
    removedPoiIds
  });
  
  console.log('🔍 Remaining POIs details:', remainingPois.map(p => ({
    id: p.id,
    name: p.frLocalization?.name || p.enLocalization?.name,
    lat: p.latitude,
    lng: p.longitude
  })));

  // Get GPS trace path
  const tracePath = visitedTraces.map((vt: any) => [vt.longitude, vt.latitude])
    .filter((coord: any) => !isNaN(coord[0]) && !isNaN(coord[1]));

  // Calculate map bounds
  const allCoords = [
    ...visitedPois.map((p: any) => [p.longitude, p.latitude]),
    ...removedPois.map((p: any) => [p.longitude, p.latitude]),
    ...remainingPois.map((p: any) => [p.longitude, p.latitude]),
    // Include destination POI for navigation routes
    ...(destinationPoi && destinationPoi.latitude && destinationPoi.longitude 
      ? [[destinationPoi.longitude, destinationPoi.latitude]] 
      : []),
    // Include GPS trace points for better centering
    ...tracePath
  ];

  let mapCenter: [number, number] = [-5.0, 34.0]; // Default Fez
  let mapZoom = 13;

  if (allCoords.length > 0) {
    const lngs = allCoords.map(c => c[0]);
    const lats = allCoords.map(c => c[1]);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    mapCenter = [(minLng + maxLng) / 2, (minLat + maxLat) / 2];
    
    // Adjust zoom based on distance
    const latDiff = maxLat - minLat;
    const lngDiff = maxLng - minLng;
    const maxDiff = Math.max(latDiff, lngDiff);
    if (maxDiff < 0.01) mapZoom = 15;
    else if (maxDiff < 0.05) mapZoom = 14;
    else if (maxDiff < 0.1) mapZoom = 13;
    else mapZoom = 12;
  }

  const pathGeoJSON = tracePath.length > 0 ? {
    type: 'Feature' as const,
    geometry: {
      type: 'LineString' as const,
      coordinates: tracePath
    },
    properties: {}
  } : null;

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Routes
          </button>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mb-2"
                style={{
                  backgroundColor: isCircuitRoute ? '#007036' : '#2563eb',
                  color: 'white'
                }}
              >
                {isCircuitRoute ? (
                  <>
                    <RouteIcon className="w-3 h-3" />
                    Circuit Route
                  </>
                ) : (
                  <>
                    <MapPin className="w-3 h-3" />
                    Single POI Navigation
                  </>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isCircuitRoute 
                  ? (route.circuit?.fr?.name || route.circuit?.en?.name || 'Circuit Route')
                  : route.poiName}
              </h1>
              {isCircuitRoute && route.circuit?.city && (
                <p className="text-gray-600 mt-1">
                  {route.circuit.city.fr?.name || route.circuit.city.en?.name}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <RouteIcon className="w-4 h-4" />
              <span className="text-xs">Distance</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {route.distance ? `${route.distance.toFixed(1)} km` : 'N/A'}
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs">Duration</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {route.duration ? `${Math.round(route.duration)} min` : 'N/A'}
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              {getTransportIcon(route.transportMode)}
              <span className="text-xs">Transport</span>
            </div>
            <p className="text-lg font-semibold text-gray-900 capitalize">
              {route.transportMode || 'foot'}
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Award className="w-4 h-4" />
              <span className="text-xs">Points</span>
            </div>
            <p className="text-xl font-bold text-[#007036]">
              +{route.pointsEarned || 0}
            </p>
          </div>

          {isCircuitRoute && (
            <>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs">Visited</span>
                </div>
                <p className="text-xl font-bold text-green-600">
                  {visitedPois.length}
                </p>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <XCircle className="w-4 h-4" />
                  <span className="text-xs">Skipped</span>
                </div>
                <p className="text-xl font-bold text-red-600">
                  {removedPois.length}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Map with Legend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Route Map</h2>
            <p className="text-sm text-gray-600 mt-1">
              {formatDate(route.completedAt || route.createdAt)}
            </p>
          </div>

          <div className="relative h-[600px]">
            {isMounted && (
              <Map
                mapLib={maplibregl}
                initialViewState={{
                  longitude: mapCenter[0],
                  latitude: mapCenter[1],
                  zoom: mapZoom
                }}
                style={{ width: '100%', height: '100%' }}
                mapStyle={MAP_STYLE}
              >
              {/* GPS Trace Path */}
              {pathGeoJSON && (
                <>
                  {/* Border (bottom layer) */}
                  <Source id="route-path-border" type="geojson" data={pathGeoJSON}>
                    <Layer
                      id="route-border-line"
                      type="line"
                      paint={{
                        'line-color': '#000000',
                        'line-width': 8,
                        'line-opacity': 0.8
                      }}
                      layout={{ 'line-cap': 'round', 'line-join': 'round' }}
                    />
                  </Source>
                  {/* Main line (top layer) */}
                  <Source id="route-path" type="geojson" data={pathGeoJSON}>
                    <Layer
                      id="route-line"
                      type="line"
                      paint={{
                        'line-color': '#007036',
                        'line-width': 4,
                        'line-opacity': 0.9
                      }}
                      layout={{ 'line-cap': 'round', 'line-join': 'round' }}
                    />
                  </Source>
                </>
              )}

              {/* Visited POI Markers */}
              {visitedPois.map((poi: any, idx: number) => (
                <Marker
                  key={`visited-${poi.id}-${idx}`}
                  longitude={poi.longitude}
                  latitude={poi.latitude}
                >
                  <div className="relative">
                    <div className="w-8 h-8 bg-green-600 border-2 border-white rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </Marker>
              ))}

              {/* Removed POI Markers */}
              {removedPois.map((poi: any, idx: number) => (
                <Marker
                  key={`removed-${poi.id}-${idx}`}
                  longitude={poi.longitude}
                  latitude={poi.latitude}
                >
                  <div className="relative">
                    <div className="w-8 h-8 bg-red-600 border-2 border-white rounded-full flex items-center justify-center shadow-lg">
                      <XCircle className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </Marker>
              ))}

              {/* Remaining POI Markers */}
              {remainingPois.map((poi: any, idx: number) => (
                <Marker
                  key={`remaining-${poi.id}-${idx}`}
                  longitude={poi.longitude}
                  latitude={poi.latitude}
                >
                  <div className="relative">
                    <div className="w-8 h-8 bg-gray-400 border-2 border-white rounded-full flex items-center justify-center shadow-lg">
                      <CircleDot className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </Marker>
              ))}

              {/* Navigation Route: Show Destination POI */}
              {!isCircuitRoute && destinationPoi && destinationPoi.latitude && destinationPoi.longitude && (
                <Marker
                  longitude={destinationPoi.longitude}
                  latitude={destinationPoi.latitude}
                >
                  <div className="relative cursor-pointer group">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#007036] text-white px-3 py-1.5 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10">
                      {destinationPoi.frLocalization?.name || destinationPoi.enLocalization?.name || route.poiName || 'Destination'}
                    </div>
                    {/* Destination marker with flag icon */}
                    <div className="relative">
                      <div className="w-10 h-10 bg-red-600 border-2 border-white rounded-full flex items-center justify-center shadow-xl">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      {/* Pulsing ring animation */}
                      <div className="absolute inset-0 w-10 h-10 bg-red-600 rounded-full animate-ping opacity-30"></div>
                    </div>
                  </div>
                </Marker>
              )}

              {/* Navigation Route: Show Start Location */}
              {!isCircuitRoute && (() => {
                let startLng, startLat;
                
                // Use first trace point if available, otherwise use route.startLocation
                if (tracePath.length > 0) {
                  startLng = tracePath[0][0];
                  startLat = tracePath[0][1];
                } else if (route.startLocation) {
                  try {
                    const startLoc = typeof route.startLocation === 'string' 
                      ? JSON.parse(route.startLocation) 
                      : route.startLocation;
                    startLng = startLoc.lng || startLoc.longitude;
                    startLat = startLoc.lat || startLoc.latitude;
                  } catch (e) {
                    return null;
                  }
                } else {
                  return null;
                }

                if (!startLng || !startLat || isNaN(startLng) || isNaN(startLat)) {
                  return null;
                }

                return (
                  <Marker
                    key="start-location"
                    longitude={startLng}
                    latitude={startLat}
                  >
                    <div className="relative cursor-pointer group">
                      {/* Tooltip */}
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10">
                        Start Location
                      </div>
                      {/* Start marker */}
                      <div className="relative">
                        <div className="w-10 h-10 bg-green-600 border-2 border-white rounded-full flex items-center justify-center shadow-xl">
                          <div className="w-4 h-4 bg-white rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </Marker>
                );
              })()}

              {/* Current Location (last trace) */}
              {tracePath.length > 0 && (
                <Marker
                  longitude={tracePath[tracePath.length - 1][0]}
                  latitude={tracePath[tracePath.length - 1][1]}
                >
                  <div className="w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-lg animate-pulse" />
                </Marker>
              )}
              </Map>
            )}

            {/* Legend Overlay */}
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200 max-w-[220px]">
              <h3 className="font-semibold text-sm text-gray-900 mb-3">Legend</h3>
              <div className="space-y-2.5">
                {!isCircuitRoute && (
                  <>
                    {/* Start Location - for navigation routes */}
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-green-600 border-2 border-white rounded-full flex items-center justify-center shadow-sm">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                      <span className="text-xs text-gray-700">Start Location</span>
                    </div>
                    {/* Destination POI - for navigation routes */}
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-red-600 border-2 border-white rounded-full flex items-center justify-center shadow-sm">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs text-gray-700">Destination POI</span>
                    </div>
                  </>
                )}
                {isCircuitRoute && (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-600 border-2 border-white rounded-full flex items-center justify-center shadow-sm">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs text-gray-700">Visited POI</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-red-600 border-2 border-white rounded-full flex items-center justify-center shadow-sm">
                        <XCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs text-gray-700">Skipped POI</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-400 border-2 border-white rounded-full flex items-center justify-center shadow-sm">
                        <CircleDot className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs text-gray-700">Remaining POI</span>
                    </div>
                  </>
                )}
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-sm animate-pulse"></div>
                  <span className="text-xs text-gray-700">Current Location</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <div className="w-3 h-2 bg-black rounded-sm"></div>
                    <div className="w-3 h-1 bg-[#007036] -ml-1.5"></div>
                  </div>
                  <span className="text-xs text-gray-700">Your Path</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* POI Lists */}
        {isCircuitRoute && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Visited POIs */}
            {visitedPois.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Visited POIs ({visitedPois.length})
                </h3>
                <div className="space-y-2">
                  {visitedPois.map((poi: any, idx: number) => {
                    const poiName = poi.frLocalization?.name || poi.enLocalization?.name || poi.arLocalization?.name || `POI #${idx + 1}`;
                    return (
                      <div key={poi.id || idx} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                        <div className="w-2 h-2 bg-green-600 rounded-full flex-shrink-0"></div>
                        <span className="text-sm text-gray-700">{poiName}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Skipped POIs */}
            {removedPois.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  Skipped POIs ({removedPois.length})
                </h3>
                <div className="space-y-2">
                  {removedPois.map((poi: any, idx: number) => {
                    const poiName = poi.frLocalization?.name || poi.enLocalization?.name || poi.arLocalization?.name || `POI #${idx + 1}`;
                    return (
                      <div key={poi.id || idx} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                        <div className="w-2 h-2 bg-red-600 rounded-full flex-shrink-0"></div>
                        <span className="text-sm text-gray-700">{poiName}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
