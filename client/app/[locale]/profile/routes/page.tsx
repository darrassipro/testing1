"use client";

import React, { useState } from 'react';
import { useGetUserRoutesQuery } from '@/services/api/RouteApi';
import { MapPin, Clock, Route as RouteIcon, Award, Calendar, Car, Bike, User as WalkIcon, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RoutesHistoryPage() {
  const { data, isLoading, error } = useGetUserRoutesQuery();
  const router = useRouter();
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);

  const getTransportIcon = (mode: string) => {
    switch (mode) {
      case 'car':
      case 'motorcycle':
        return <Car className="w-4 h-4" />;
      case 'bike':
        return <Bike className="w-4 h-4" />;
      case 'foot':
        return <WalkIcon className="w-4 h-4" />;
      default:
        return <WalkIcon className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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
          <span className="text-lg">Loading your routes...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">Failed to load routes</p>
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

  const routes = data?.data?.routes || [];
  const stats = {
    totalPoints: data?.data?.totalPoints || 0,
    totalRoutes: data?.data?.totalRoutes || 0,
    totalDistance: data?.data?.totalDistance || 0,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Profile
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Routes</h1>
          <p className="text-gray-600">Track your journey and achievements</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#007036]/10 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-[#007036]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Points</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPoints}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <RouteIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Routes Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRoutes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Distance</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDistance ? `${stats.totalDistance.toFixed(1)} km` : '0.0 km'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Routes List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Route History</h2>
            <p className="text-gray-600 mt-1">{routes.length} {routes.length === 1 ? 'route' : 'routes'} completed</p>
          </div>

          {routes.length === 0 ? (
            <div className="p-12 text-center">
              <RouteIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No routes yet</h3>
              <p className="text-gray-600 mb-6">Start exploring and save your first route!</p>
              <button
                onClick={() => router.push('/en')}
                className="px-6 py-3 bg-[#007036] text-white rounded-lg hover:bg-[#005a2b] transition-colors"
              >
                Explore Now
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {routes.map((route) => (
                <div
                  key={route.id}
                  className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedRoute(selectedRoute === route.id ? null : route.id)}
                >
                  <div className="flex items-start gap-4">
                    {/* POI Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={route.poiImage || 'https://placehold.co/100x100?text=POI'}
                        alt={route.poiName}
                        className="w-20 h-20 rounded-xl object-cover"
                      />
                    </div>

                    {/* Route Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{route.poiName}</h3>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <RouteIcon className="w-4 h-4 flex-shrink-0" />
                          <span>{route.distance ? `${route.distance} km` : 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4 flex-shrink-0" />
                          <span>{route.duration ? `${route.duration} min` : 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          {getTransportIcon(route.transportMode)}
                          <span className="capitalize">{route.transportMode || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-[#007036]">
                          <Award className="w-4 h-4 flex-shrink-0" />
                          <span>+{route.pointsEarned || 0} pts</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(route.completedAt || route.createdAt)}</span>
                      </div>

                      {/* Expanded Details */}
                      {selectedRoute === route.id && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-semibold text-gray-700 mb-1">Start Location</p>
                              <p className="text-sm text-gray-600">
                                {route.startLocation?.address || 
                                  (route.startLocation?.lat && route.startLocation?.lng 
                                    ? `Your Location (${route.startLocation.lat.toFixed(4)}, ${route.startLocation.lng.toFixed(4)})`
                                    : 'Your Location')}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-700 mb-1">Destination</p>
                              <p className="text-sm text-gray-600">
                                {route.endLocation?.address || route.poiName || 
                                  (route.endLocation?.lat && route.endLocation?.lng 
                                    ? `${route.endLocation.lat.toFixed(4)}, ${route.endLocation.lng.toFixed(4)}`
                                    : route.poiName || 'N/A')}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
