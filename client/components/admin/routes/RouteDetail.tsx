"use client";

import React from 'react';
import { useGetRouteDetailAdminQuery } from '@/services/api/RouteApi';
import RouteDetailMap from './RouteDetailMap';
import { 
  User, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  Navigation,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface RouteDetailProps {
  routeId: string;
}

export default function RouteDetail({ routeId }: RouteDetailProps) {
  const router = useRouter();
  const { data, isLoading, error } = useGetRouteDetailAdminQuery(routeId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#007036] mx-auto mb-4" />
          <p className="text-gray-600">Loading route details...</p>
        </div>
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Failed to load route details</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const {
    route,
    statistics,
    visitedTraces,
    visitedPois,
    removedPois,
    remainingPois,
    currentLocation
  } = data.data;

  // Debug: Log route data structure
  console.log('🔍 DEBUG - Route data:', {
    id: route.id,
    isCircuitRoute: route.isCircuitRoute,
    circuitId: route.circuitId,
    circuit: route.circuit,
    poiName: route.poiName,
    distance: route.distance
  });

  const isCircuitRoute = route.isCircuitRoute;
  const routeTitle = isCircuitRoute 
    ? (route.circuit?.fr?.name || route.circuit?.en?.name || route.circuit?.ar?.name || 'Route Details')
    : (route.poiName || 'Navigation Route');
  const cityName = isCircuitRoute 
    ? (route.circuit?.city?.fr?.name || route.circuit?.city?.en?.name || route.circuit?.city?.name || 'Unknown City')
    : 'Navigation';

  const getPOIName = (poi: any) => {
    return poi.frLocalization?.name || poi.enLocalization?.name || poi.arLocalization?.name || 'POI';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Routes
          </Button>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {routeTitle}
                </h1>
                <p className="text-gray-600">
                  {cityName}
                </p>
                {!isCircuitRoute && route.transportMode && (
                  <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                    {route.transportMode}
                  </span>
                )}
              </div>
              <div>
                {route.isCompleted ? (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-4 h-4" />
                    Completed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    <Clock className="w-4 h-4" />
                    In Progress
                  </span>
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {route.user.firstName} {route.user.lastName}
                </p>
                <p className="text-xs text-gray-600">{route.user.email}</p>
              </div>
              <div className="ml-auto flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Started: {new Date(route.createdAt).toLocaleDateString()}
                </div>
                {route.completedAt && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Completed: {new Date(route.completedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total POIs</span>
              <MapPin className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{statistics.totalPOIs}</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Visited</span>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-green-600">{statistics.visitedCount}</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Removed</span>
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-2xl font-bold text-red-600">{statistics.removedCount}</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Remaining</span>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-600">{statistics.remainingCount}</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Distance</span>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{statistics.totalDistance} km</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Duration</span>
              <Clock className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-purple-600">{statistics.duration} min</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">GPS Traces</span>
              <Navigation className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-orange-600">{statistics.tracesCount}</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Completion</span>
              <CheckCircle className="w-5 h-5 text-[#007036]" />
            </div>
            <div className="text-2xl font-bold text-[#007036]">
              {statistics.completionPercentage || 0}%
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Route Map</h2>
              <div className="h-[600px]">
                <RouteDetailMap
                  visitedTraces={visitedTraces}
                  visitedPois={visitedPois}
                  removedPois={removedPois}
                  remainingPois={remainingPois}
                  currentLocation={currentLocation}
                />
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Visited POIs */}
            {(isCircuitRoute || visitedPois.length > 0) && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  {isCircuitRoute ? 'Visited POIs' : 'POIs'} ({visitedPois.length})
                </h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {visitedPois.length === 0 ? (
                  <p className="text-sm text-gray-500">No POIs visited yet</p>
                ) : (
                  visitedPois.map((poi: any) => (
                    <div key={poi.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      {poi.initialImage && (
                        <img
                          src={poi.initialImage}
                          alt={getPOIName(poi)}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {getPOIName(poi)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            )}

            {/* Removed POIs - Only for circuit routes */}
            {isCircuitRoute && removedPois.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                Removed POIs ({removedPois.length})
              </h3>
              <div className="space-y-3 max-h-[200px] overflow-y-auto">
                {removedPois.length === 0 ? (
                  <p className="text-sm text-gray-500">No POIs removed</p>
                ) : (
                  removedPois.map((poi: any) => (
                    <div key={poi.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      {poi.initialImage && (
                        <img
                          src={poi.initialImage}
                          alt={getPOIName(poi)}
                          className="w-12 h-12 object-cover rounded opacity-60"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {getPOIName(poi)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            )}

            {/* Remaining POIs - Only for circuit routes */}
            {isCircuitRoute && remainingPois.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-600" />
                Remaining POIs ({remainingPois.length})
              </h3>
              <div className="space-y-3 max-h-[200px] overflow-y-auto">
                {remainingPois.length === 0 ? (
                  <p className="text-sm text-gray-500">All POIs visited or removed</p>
                ) : (
                  remainingPois.map((poi: any) => (
                    <div key={poi.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      {poi.initialImage && (
                        <img
                          src={poi.initialImage}
                          alt={getPOIName(poi)}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {getPOIName(poi)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            )}
          </div>
        </div>

        {/* Visited Traces Timeline */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">GPS Tracking Timeline</h2>
          <div className="max-h-[400px] overflow-y-auto">
            <div className="space-y-2">
              {visitedTraces.length === 0 ? (
                <p className="text-sm text-gray-500">No GPS traces recorded</p>
              ) : (
                visitedTraces.map((trace, index) => (
                  <div
                    key={trace.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 border border-gray-100"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#007036] text-white text-xs font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {trace.latitude.toFixed(6)}, {trace.longitude.toFixed(6)}
                      </p>
                      {trace.poi && (
                        <p className="text-xs text-green-600 font-medium">
                          POI: {getPOIName(trace.poi)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">
                        {new Date(trace.createdAt).toLocaleTimeString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(trace.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
