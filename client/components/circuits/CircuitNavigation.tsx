"use client";

import React, { useState, useEffect } from 'react';
import { 
  useStartRouteMutation, 
  useGetRouteByIdQuery, 
  useAddVisitedTraceMutation,
  useRemovePOIFromRouteMutation 
} from '@/services/api/RouteApi';
import { MapPin, Navigation, Clock, Award, X, CheckCircle, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CircuitNavigationProps {
  circuitId: string;
  userLocation: { lat: number; lng: number } | null;
  onClose?: () => void;
}

export default function CircuitNavigation({ circuitId, userLocation, onClose }: CircuitNavigationProps) {
  const [routeId, setRouteId] = useState<string | null>(null);
  const [currentPOIIndex, setCurrentPOIIndex] = useState(0);
  const [lastTraceTime, setLastTraceTime] = useState<number>(0);
  
  // API hooks
  const [startRoute, { isLoading: isStarting }] = useStartRouteMutation();
  const [addTrace, { isLoading: isAddingTrace }] = useAddVisitedTraceMutation();
  const [removePOI, { isLoading: isRemovingPOI }] = useRemovePOIFromRouteMutation();
  
  // Fetch route details when routeId is set
  const { data: routeData, isLoading: isLoadingRoute } = useGetRouteByIdQuery(routeId || '', {
    skip: !routeId,
  });

  // Automatic GPS tracking - send trace every 30 seconds while route is active
  useEffect(() => {
    if (!routeId || !userLocation) return;

    const sendGPSTrace = async () => {
      const now = Date.now();
      // Send trace every 30 seconds (30000ms)
      if (now - lastTraceTime < 30000) return;

      try {
        console.log('📍 Sending automatic GPS trace:', userLocation);
        await addTrace({
          routeId,
          latitude: userLocation.lat,
          longitude: userLocation.lng,
        }).unwrap();
        setLastTraceTime(now);
      } catch (error) {
        console.error('Failed to send GPS trace:', error);
      }
    };

    // Send trace immediately when location changes
    sendGPSTrace();

    // Set up interval for continuous tracking
    const interval = setInterval(sendGPSTrace, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [routeId, userLocation, lastTraceTime, addTrace]);

  const handleStartRoute = async () => {
    if (!userLocation) {
      alert('Please enable location services');
      return;
    }

    try {
      const result = await startRoute({
        circuitId,
        latitude: userLocation.lat,
        longitude: userLocation.lng,
      }).unwrap();

      if (result.status && result.data?.firstTrace) {
        // Extract route ID from first trace
        const newRouteId = result.data.firstTrace.routeId;
        setRouteId(newRouteId);
        alert('Route started successfully! Start exploring the circuit.');
      }
    } catch (error: any) {
      console.error('Failed to start route:', error);
      alert(error?.data?.message || 'Failed to start route');
    }
  };

  const handleCheckIn = async (poiId: string) => {
    if (!routeId || !userLocation) return;

    try {
      const result = await addTrace({
        routeId,
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        pois: [poiId],
      }).unwrap();

      if (result.status) {
        if (result.data?.isRouteCompleted) {
          alert(`🎉 Congratulations! Circuit completed! ${result.data?.albumId ? 'Album created!' : ''}`);
          onClose?.();
        } else {
          alert('✓ POI visited successfully!');
          setCurrentPOIIndex(prev => prev + 1);
        }
      }
    } catch (error: any) {
      console.error('Failed to add trace:', error);
      alert(error?.data?.message || 'Failed to check in');
    }
  };

  const handleRemovePOI = async (poiId: string) => {
    if (!routeId) return;

    if (!confirm('Are you sure you want to remove this POI from your route?')) {
      return;
    }

    try {
      const result = await removePOI({
        routeId,
        poiId,
      }).unwrap();

      if (result.status) {
        if (result.data?.isRouteCompleted) {
          alert(`Circuit completed! ${result.data?.albumId ? 'Album created!' : ''}`);
          onClose?.();
        } else {
          alert('POI removed from your route');
        }
      }
    } catch (error: any) {
      console.error('Failed to remove POI:', error);
      alert(error?.data?.message || 'Failed to remove POI');
    }
  };

  const pois = routeData?.data?.pois || [];
  const visitedTraces = routeData?.data?.visitedTraces || [];
  const route = routeData?.data?.route;

  // Get visited POI IDs
  const visitedPOIIds = visitedTraces
    .filter(trace => trace.idPoi)
    .map(trace => trace.idPoi);

  return (
    <div className="fixed inset-0 z-[10000] bg-black/50 flex items-end md:items-center justify-center">
      <div className="bg-white rounded-t-3xl md:rounded-2xl w-full md:max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Circuit Navigation</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!routeId ? (
            // Start Route Screen
            <div className="text-center py-8">
              <Navigation className="w-16 h-16 text-[#007036] mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to explore?</h3>
              <p className="text-gray-600 mb-6">
                Start navigating this circuit and visit all the points of interest
              </p>
              <Button
                onClick={handleStartRoute}
                disabled={isStarting || !userLocation}
                className="bg-[#007036] hover:bg-[#005a2b] text-white px-8 py-3"
              >
                {isStarting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Navigation className="w-5 h-5 mr-2" />
                    Start Circuit
                  </>
                )}
              </Button>
            </div>
          ) : (
            // Navigation Screen
            <div>
              {/* Route Status */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Progress</span>
                  <span className="text-sm font-bold text-[#007036]">
                    {visitedPOIIds.length} / {pois.length} POIs
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#007036] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${pois.length > 0 ? (visitedPOIIds.length / pois.length) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* POIs List */}
              {isLoadingRoute ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-[#007036] mx-auto mb-2" />
                  <p className="text-gray-600">Loading route details...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-4">Points of Interest</h3>
                  
                  {pois.map((poi: any, index: number) => {
                    const isVisited = visitedPOIIds.includes(poi.id);
                    const isCurrent = index === currentPOIIndex && !isVisited;

                    return (
                      <div
                        key={poi.id}
                        className={`border rounded-lg p-4 transition-all ${
                          isVisited
                            ? 'bg-green-50 border-green-200'
                            : isCurrent
                            ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {/* POI Image */}
                          <img
                            src={poi.initialImage || 'https://placehold.co/80x80?text=POI'}
                            alt={poi.frLocalization?.name || poi.name}
                            className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                          />

                          {/* POI Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h4 className="font-semibold text-gray-900">
                                {poi.frLocalization?.name || poi.name}
                              </h4>
                              {isVisited && (
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                              )}
                            </div>

                            {poi.frLocalization?.description && (
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {poi.frLocalization.description}
                              </p>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2">
                              {!isVisited && (
                                <>
                                  <Button
                                    onClick={() => handleCheckIn(poi.id)}
                                    disabled={isAddingTrace}
                                    size="sm"
                                    className="bg-[#007036] hover:bg-[#005a2b] text-white"
                                  >
                                    {isAddingTrace ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <>
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        Check In
                                      </>
                                    )}
                                  </Button>
                                  
                                  <Button
                                    onClick={() => handleRemovePOI(poi.id)}
                                    disabled={isRemovingPOI}
                                    size="sm"
                                    variant="outline"
                                    className="border-red-200 text-red-600 hover:bg-red-50"
                                  >
                                    {isRemovingPOI ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <>
                                        <Trash2 className="w-4 h-4 mr-1" />
                                        Skip
                                      </>
                                    )}
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Completion Status */}
              {route?.isCompleted && (
                <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Award className="w-6 h-6 text-green-600" />
                    <div>
                      <h4 className="font-semibold text-green-900">Circuit Completed!</h4>
                      <p className="text-sm text-green-700">
                        Congratulations on completing this circuit!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
