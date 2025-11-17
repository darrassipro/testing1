"use client";

import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
import Map, { Marker, Source, Layer } from "react-map-gl/maplibre";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Search, Navigation, Star, ArrowUpRight, Share2, MapIcon, Clock, X, ArrowLeft, Play, Pause, RotateCcw, Route as RouteIcon, Car, Bike, User as WalkIcon, ChevronLeft, ChevronRight, CheckCircle2, Bookmark, Home, Lock, LogIn } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { POI, useGetPOIByIdQuery } from "@/services/api/PoiApi";
import { useSaveRouteMutation, useGetUserRoutesQuery } from "@/services/api/RouteApi";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { useGPSTracker } from "@/hooks/useGPSTracker";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";

const MAP_STYLE =
  "https://api.maptiler.com/maps/019a213d-06f4-7ef2-be61-48b4b8fb7e56/style.json?key=cKuGgc1qdSgluaz2JWLK";
const DEFAULT_ZOOM = 13;
const DEFAULT_CENTER = { lat: 34.0331, lng: -4.9998 }; // Fès, MA

interface InteractiveMapProps {
  pois: POI[];
  userLocation: { lat: number; lng: number };
  locale: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

interface NormalizedPOI {
  id: string;
  name: string;
  category: string;
  categoryName: string;
  lat: number;
  lng: number;
  image?: string;
  rating?: number;
  reviewCount?: number;
  raw: POI;
}

export default function InteractiveMap({
  pois,
  userLocation,
  locale,
  searchQuery,
  onSearchChange,
}: InteractiveMapProps) {
  const mapRef = useRef<any>(null);
  // Viewer modal state for media preview (image/video)
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerSrc, setViewerSrc] = useState<string | null>(null);
  const [viewerKind, setViewerKind] = useState<'image' | 'video'>('image');
  const [selectedPoiId, setSelectedPoiId] = useState<string | null>(null);
  const [hoveredPoi, setHoveredPoi] = useState<string | null>(null);
  const [routeGeoJSON, setRouteGeoJSON] = useState<any>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [nearbyPois, setNearbyPois] = useState<NormalizedPOI[]>([]);
  const [transportMode, setTransportMode] = useState<'car' | 'foot' | 'bike' | 'motorcycle'>('foot');
  const [routeInfo, setRouteInfo] = useState<{ duration: number; distance: number } | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [routeSteps, setRouteSteps] = useState<any[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isNavigationPaused, setIsNavigationPaused] = useState(false);
  const [showArrivalPopup, setShowArrivalPopup] = useState(false);
  const [rewardPoints, setRewardPoints] = useState(100);
  const [isReverseRoute, setIsReverseRoute] = useState(false);
  const [originalStartLocation, setOriginalStartLocation] = useState<{ lat: number; lng: number } | null>(null);
const handleTriggerLogin = () => {
  // Hide the overlay immediately so it doesn't block the modal
  setIsLoginProcessing(true); 
  document.dispatchEvent(new CustomEvent("triggerLoginModal"));
};
  // Get user data from Redux
  const { user } = useSelector((state: RootState) => state.auth);
  
  // GPS Tracking 
  const { position: gpsPosition, error: gpsError, startTracking, stopTracking } = useGPSTracker(true);
  
  // Fetch detailed POI data when selected
  const { data: fetchedPoiData, isFetching: isFetchingPoi } = useGetPOIByIdQuery(
    selectedPoiId ?? (skipToken as any)
  );

  // Save route mutation
  const [saveRoute, { isLoading: isSavingRoute }] = useSaveRouteMutation();
  
  // Get user routes for statistics
  const { data: userRoutesData } = useGetUserRoutesQuery(undefined, {
    skip: !user, // Only fetch if user is logged in
  });

// Normalize POIs
  const normalizedPois = useMemo(() => {
    return pois
      .map((poi) => {
        const localizedData = poi[`${locale}Localization` as keyof typeof poi] as any;
        const name = localizedData?.name || "POI";

        let lat: number | null = null;
        let lng: number | null = null;

        // Handle different coordinate formats
        if (poi.coordinates) {
          if ("latitude" in poi.coordinates && "longitude" in poi.coordinates) {
            lat = Number(poi.coordinates.latitude);
            lng = Number(poi.coordinates.longitude);
          } else if ("coordinates" in poi.coordinates && Array.isArray(poi.coordinates.coordinates)) {
            lng = Number(poi.coordinates.coordinates[0]);
            lat = Number(poi.coordinates.coordinates[1]);
          }
        }

        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
          return null;
        }

        const files = poi.files || [];
        const imageFile = files.find((f) => f.type === "image");
        const image = imageFile?.fileUrl;

        const rating = poi.rating ? Number(poi.rating) : undefined;
        const reviewCount = poi.reviewCount ? Number(poi.reviewCount) : 0;

        // --- FIX STARTS HERE ---
        let categoryName = "Category";
        
        if (poi.categoryPOI) {
          try {
            // 1. Get the raw data for the current locale (e.g., 'fr', 'en', 'ar')
            // We use 'as any' to bypass strict typing issues with the dynamic key
            const rawLocData = (poi.categoryPOI as any)[locale];

            if (rawLocData) {
              // 2. Parse it if it is a string (This is what your debug log showed was missing!)
              const parsedLoc = typeof rawLocData === 'string' 
                ? JSON.parse(rawLocData) 
                : rawLocData;

              // 3. Extract the name
              if (parsedLoc && parsedLoc.name) {
                categoryName = parsedLoc.name;
              }
            }
          } catch (error) {
            console.error("Error parsing category JSON:", error);
          }
        }
        // --- FIX ENDS HERE ---

        return {
          id: poi.id,
          name,
          category: poi.category, // Keep ID for filtering logic
          categoryName: categoryName, // New field for Display
          lat: lat!,
          lng: lng!,
          image,
          rating,
          reviewCount,
          raw: poi,
        };
      })
      .filter((p) => p !== null) as NormalizedPOI[];
  }, [pois, locale]);
  // Active category filter (null = show all)
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Filtered POIs according to active category
  const filteredPois = useMemo(() => {
    if (!activeCategory) return normalizedPois;
    return normalizedPois.filter((p) => p.category === activeCategory);
  }, [normalizedPois, activeCategory]);
const [isLoginProcessing, setIsLoginProcessing] = useState(false);

  // Calculate nearby POIs - get top 4 POIs
  useEffect(() => {
    if (user) {
    setIsLoginProcessing(false);
  }
    // Show top 4 nearby from the currently filtered set
    if (filteredPois.length > 0) {
      const nearby = filteredPois.slice(0, 4);
      setNearbyPois(nearby);
    } else {
      setNearbyPois([]);
    }
  }, [user, filteredPois]);

  // Update map view when category filter changes
  useEffect(() => {
    if (!mapRef.current) return;

    if (!activeCategory) {
      // reset to user location when clearing filter (if available)
      if (userLocation) {
        mapRef.current.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: DEFAULT_ZOOM, duration: 800 });
      }
      return;
    }

    if (filteredPois.length === 0) return;

    // Fit bounds to filtered POIs and include user location if available
    let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
    filteredPois.forEach((p) => {
      if (p.lng < minLng) minLng = p.lng;
      if (p.lat < minLat) minLat = p.lat;
      if (p.lng > maxLng) maxLng = p.lng;
      if (p.lat > maxLat) maxLat = p.lat;
    });

    if (userLocation) {
      const ul = userLocation;
      if (ul.lng < minLng) minLng = ul.lng;
      if (ul.lat < minLat) minLat = ul.lat;
      if (ul.lng > maxLng) maxLng = ul.lng;
      if (ul.lat > maxLat) maxLat = ul.lat;
    }

    // if bounds are valid, fit to them
    if (isFinite(minLng) && isFinite(minLat) && isFinite(maxLng) && isFinite(maxLat)) {
      mapRef.current.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: 80, duration: 800 });
    }

    // if the currently selected POI is not part of the filtered set, clear it
    if (selectedPoiId && !filteredPois.find((p) => p.id === selectedPoiId)) {
      setSelectedPoiId(null);
      setRouteGeoJSON(null);
      setRouteInfo(null);
    }
  }, [activeCategory, filteredPois, mapRef, userLocation, selectedPoiId]);

  const handleCategoryClick = (category: string | null | undefined) => {
    if (!category) return;
    setActiveCategory((cur) => (cur === category ? null : category));
  };
  // Listen for external category selection events (useful if a separate filter component triggers it)
  useEffect(() => {
    const onCategorySelected = (ev: any) => {
      try {
        const detailCat = ev?.detail?.category;
        if (!detailCat) return;
        setActiveCategory((cur) => (cur === detailCat ? null : detailCat));
      } catch (e) {}
    };

    document.addEventListener('categorySelected', onCategorySelected as EventListener);
    return () => document.removeEventListener('categorySelected', onCategorySelected as EventListener);
  }, []);
  useEffect(() => {
    const handleAuthModalClosed = () => {
      if (!user) {
        setIsLoginProcessing(false); // Re-show the overlay
      }
    };

    document.addEventListener("authModalClosed", handleAuthModalClosed);
    return () => document.removeEventListener("authModalClosed", handleAuthModalClosed);
  }, [user]);

  // Calculate distance between two points in kilometers
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
  };
  
  // Get selected POI from normalized list
  const selectedPoi = useMemo(() => {
    if (!selectedPoiId) return null;
    return normalizedPois.find(p => p.id === selectedPoiId) || null;
  }, [selectedPoiId, normalizedPois]);

  // Check if user has reached destination (final step)
  useEffect(() => {
    if (isNavigating && routeSteps.length > 0 && !showArrivalPopup) {
      // Check if user is on the last step
      if (currentStepIndex === routeSteps.length - 1) {
        // Show arrival popup when reaching final step
        handleArrival();
      }
    }
  }, [currentStepIndex, isNavigating, routeSteps.length, showArrivalPopup]);

  // Calculate route when POI is selected
  const calculateRoute = async (destinationPoi: NormalizedPOI, reverse: boolean = false) => {
    if (!userLocation) return;

    setIsCalculatingRoute(true);
    setRouteGeoJSON(null);
    setRouteInfo(null);
    setRouteSteps([]);

    try {
      let startLat, startLng, endLat, endLng;
      
      if (reverse && originalStartLocation) {
        // Reverse route: from current POI location back to original start
        startLat = destinationPoi.lat;
        startLng = destinationPoi.lng;
        endLat = originalStartLocation.lat;
        endLng = originalStartLocation.lng;
      } else {
        // Normal route: from user location to POI
        startLat = userLocation.lat;
        startLng = userLocation.lng;
        endLat = destinationPoi.lat;
        endLng = destinationPoi.lng;
        
        // Save original start location for reverse route
        if (!originalStartLocation) {
          setOriginalStartLocation({ lat: userLocation.lat, lng: userLocation.lng });
        }
      }
      
      const coords = `${startLng},${startLat};${endLng},${endLat}`;
      
      // Map transport mode to OSRM profile
      let profile = 'foot';
      if (transportMode === 'car' || transportMode === 'motorcycle') {
        profile = 'car';
      } else if (transportMode === 'bike') {
        profile = 'bike';
      } else {
        profile = 'foot';
      }
      
      // Use the correct OSRM endpoint for each profile
      const url = `https://routing.openstreetmap.de/routed-${profile}/route/v1/${profile}/${coords}?overview=full&geometries=geojson&steps=true`;
      
      console.log(`[Route] Calculating ${reverse ? 'REVERSE' : 'normal'} route for ${transportMode} using profile: ${profile}`);
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Routing error");
      
      const data = await res.json();
      if (data.code !== "Ok" || !data.routes || !data.routes[0]) {
        throw new Error("Route not found");
      }

      const route = data.routes[0];
      const line = route.geometry;
      const fc = {
        type: "FeatureCollection",
        features: [{ type: "Feature", properties: {}, geometry: line }],
      };
      setRouteGeoJSON(fc);
      
      // Set route info (duration in minutes, distance in km)
      // OSRM returns duration in seconds based on the profile's speed
      const durationMinutes = Math.round(route.duration / 60);
      const distanceKm = parseFloat((route.distance / 1000).toFixed(1));
      
      console.log(`[Route] ${transportMode}: ${distanceKm}km in ${durationMinutes}min (${route.duration}s raw)`);
      
      setRouteInfo({
        duration: durationMinutes,
        distance: distanceKm as any,
      });

      // Extract turn-by-turn steps
      const steps: any[] = [];
      if (route.legs && route.legs[0] && route.legs[0].steps) {
        route.legs[0].steps.forEach((step: any) => {
          if (step.maneuver) {
            steps.push({
              instruction: step.maneuver.instruction || step.name || 'Continue',
              distance: step.distance,
              duration: step.duration,
              type: step.maneuver.type,
              modifier: step.maneuver.modifier,
            });
          }
        });
      }
      setRouteSteps(steps);
      setCurrentStepIndex(0);

      // Fit bounds to show route
      if (mapRef.current) {
        const coords = line.coordinates;
        let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
        
        for (const [lng, lat] of coords) {
          if (lng < minLng) minLng = lng;
          if (lat < minLat) minLat = lat;
          if (lng > maxLng) maxLng = lng;
          if (lat > maxLat) maxLat = lat;
        }

        mapRef.current.fitBounds(
          [[minLng, minLat], [maxLng, maxLat]],
          { padding: 80, duration: 1000 }
        );
      }
    } catch (error) {
      console.error("Route calculation error:", error);
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  const handlePoiClick = (poi: NormalizedPOI) => {
    setSelectedPoiId(poi.id);
    calculateRoute(poi);
  };

  const handlePoiCardClick = (poi: NormalizedPOI) => {
    setSelectedPoiId(poi.id);
    calculateRoute(poi);
    
    // Fly to POI
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [poi.lng, poi.lat],
        zoom: 15,
        duration: 1000,
      });
    }
  };

  const handleBackToList = () => {
    setSelectedPoiId(null);
    setRouteGeoJSON(null);
    setRouteInfo(null);
    setIsNavigating(false);
    setRouteSteps([]);
    setCurrentStepIndex(0);
    setIsReverseRoute(false);
    setOriginalStartLocation(null);
  };

  const handleStartNavigation = () => {
    setIsNavigating(true);
    setIsNavigationPaused(false);
  };

  const handlePauseNavigation = () => {
    setIsNavigationPaused(!isNavigationPaused);
  };

  const handleEndNavigation = () => {
    setIsNavigating(false);
    setIsNavigationPaused(false);
    setCurrentStepIndex(0);
    setShowArrivalPopup(false);
  };

  const handleReroute = () => {
    if (selectedPoi) {
      calculateRoute(selectedPoi);
    }
  };

  const handleArrival = () => {
    // Show arrival popup with rewards
    setShowArrivalPopup(true);
    // Award points (in real app, this would call an API)
    const points = 100;
    setRewardPoints(points);
  };

  const handleSaveRoute = async () => {
    if (!selectedPoi || !routeGeoJSON || !routeInfo || !userLocation) {
      alert('No route to save!');
      return;
    }

    try {
      const result = await saveRoute({
        poiId: selectedPoi.id,
        poiName: selectedPoi.name,
        poiImage: selectedPoi.image,
        startLocation: {
          lat: originalStartLocation?.lat || userLocation.lat,
          lng: originalStartLocation?.lng || userLocation.lng,
        },
        endLocation: {
          lat: selectedPoi.lat,
          lng: selectedPoi.lng,
        },
        distance: routeInfo.distance,
        duration: routeInfo.duration,
        transportMode: transportMode,
        routeGeoJSON: routeGeoJSON,
        pointsEarned: rewardPoints,
      }).unwrap();

      if (result.status) {
        alert(`Route saved successfully! You earned ${rewardPoints} points!`);
      } else {
        alert(result.message || 'Failed to save route');
      }
    } catch (error: any) {
      console.error('Error saving route:', error);
      alert(error?.data?.message || 'Failed to save route. Please try again.');
    }
  };

  const handleShareRoute = () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareText = `I just completed a route to ${selectedPoi?.name}!`;
    
    if (navigator.share) {
      navigator.share({
        title: selectedPoi?.name,
        text: shareText,
        url: shareUrl,
      }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  const handleBackToHome = () => {
    setShowArrivalPopup(false);
    handleEndNavigation();
    handleBackToList();
  };

  const handleReverseRoute = () => {
    setShowArrivalPopup(false);
    
    if (selectedPoi && (originalStartLocation || userLocation)) {
      // Toggle reverse mode
      const reverseMode = !isReverseRoute;
      setIsReverseRoute(reverseMode);
      
      // Reset navigation
      setIsNavigating(false);
      setCurrentStepIndex(0);
      
      // Recalculate route in reverse
      setTimeout(() => {
        calculateRoute(selectedPoi, reverseMode);
        setTimeout(() => {
          setIsNavigating(true);
          setIsNavigationPaused(false);
        }, 500);
      }, 300);
    }
  };

  const handleTransportModeChange = (mode: 'car' | 'foot' | 'bike' | 'motorcycle') => {
    setTransportMode(mode);
    if (selectedPoi) {
      calculateRoute(selectedPoi);
    }
  };

  // Get POI audio URL
  const getPoiAudioUrl = (): string | null => {
    if (!fetchedPoiData?.poi) return null;
    
    const poi = fetchedPoiData.poi;
    const locKey = locale as 'fr' | 'en' | 'ar';
    const locObj = poi?.[`${locKey}Localization`] || poi?.frLocalization || poi?.enLocalization || poi?.arLocalization || null;
    
    let audioUrl: string | null = null;
    
    try {
      const audioFilesRaw: any = locObj?.audioFiles;
      if (typeof audioFilesRaw === 'string') {
        const arr = JSON.parse(audioFilesRaw);
        if (Array.isArray(arr) && arr[0]?.url) audioUrl = arr[0].url;
      } else if (Array.isArray(audioFilesRaw) && audioFilesRaw.length > 0) {
        audioUrl = audioFilesRaw[0]?.url || null;
      }
    } catch {}
    
    return audioUrl;
  };

  const centerOnUserLocation = () => {
    if (mapRef.current && userLocation) {
      mapRef.current.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 15,
        duration: 1000,
      });
    }
  };

  return (
    <div 
      className="relative mx-auto bg-[#D9D9D9] rounded-[38.209px] overflow-hidden"
      style={{
        width: '1447.92px',
        height: '620px',
        maxWidth: '100%',
      }}
    >
      {/* Map */}
      <Map
        ref={mapRef}
        initialViewState={{
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          zoom: DEFAULT_ZOOM,
        }}
        mapStyle={MAP_STYLE}
        mapLib={maplibregl}
        style={{ 
          width: "100%", 
          height: "100%",
          borderRadius: '38.209px',
        }}
      >
        {/* Route Layer */}
        {routeGeoJSON && (
          <>
            {/* Route border */}
            <Source id="route-border" type="geojson" data={routeGeoJSON}>
              <Layer
                id="route-border-line"
                type="line"
                paint={{
                  "line-color": "#000000",
                  "line-width": 6,
                  "line-opacity": 0.3,
                }}
              />
            </Source>

            {/* Route main line */}
            <Source id="route" type="geojson" data={routeGeoJSON}>
              <Layer
                id="route-line"
                type="line"
                paint={{
                  "line-color": "#055392",
                  "line-width": 4,
                  "line-opacity": 0.8,
                }}
                layout={{
                  "line-cap": "round",
                  "line-join": "round",
                }}
              />
            </Source>
          </>
        )}

        {/* User Location Marker */}
        {userLocation && (
          <Marker longitude={userLocation.lng} latitude={userLocation.lat} anchor="center">
            <div className="relative">
              {/* Pulsing circle */}
              <div className="absolute inset-0 rounded-full bg-[#007036] opacity-20 animate-ping" style={{ width: 163, height: 163, left: -81.5, top: -81.5 }}></div>
              
              {/* Gradient overlay */}
              <div
                className="absolute rounded-full"
                style={{
                  width: 163,
                  height: 163,
                  left: -81.5,
                  top: -81.5,
                  background: "rgba(0, 112, 54, 0.2)",
                }}
              >
              </div>

              {/* Main marker */}
              <div className="absolute -left-[15px] -top-[15px]">
                <div className="w-[30px] h-[30px] bg-white rounded-full border-2 border-white shadow-lg overflow-hidden">
                  {user?.profileImage ? (
                    <img 
                      src={user.profileImage} 
                      alt={user.firstName || "User"} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#007036] flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {user?.firstName?.[0]?.toUpperCase() || "U"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Marker>
        )}

        {/* POI Markers */}
        {filteredPois.map((poi) => {
          const isSelected = selectedPoi?.id === poi.id;
          const isHovered = hoveredPoi === poi.id;

          // During navigation, only show the selected POI as a small icon
          if (isNavigating && !isSelected) {
            return null;
          }

          // Show smaller POI marker during navigation
          const isNavigatingToThisPoi = isNavigating && isSelected;

          return (
            <Marker key={poi.id} longitude={poi.lng} latitude={poi.lat} anchor="bottom">
              <div
                onClick={() => !isNavigating && handlePoiClick(poi)}
                onMouseEnter={() => !isNavigating && setHoveredPoi(poi.id)}
                onMouseLeave={() => !isNavigating && setHoveredPoi(null)}
                  className={cn(
                  "border-white rounded-full overflow-hidden transition-all border-[3px] ",
                  "shadow-[0px_36px_14px_rgba(0,0,0,0.01),0px_20px_12px_rgba(0,0,0,0.05),0px_9px_9px_rgba(0,0,0,0.09),0px_2px_5px_rgba(0,0,0,0.1)]",
                  isNavigatingToThisPoi 
                    ? "w-[30px] h-[30px]  border-[#007036] cursor-default" 
                    : "w-[50px] h-[50px]  cursor-pointer",
                  !isNavigating && (isSelected || isHovered) && "scale-110 border-[#007036]"
                )}
              >
                <img
                  src={poi.image || "https://placehold.co/100x100?text=POI"}
                  alt={poi.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </Marker>
          );
        })}
      </Map>

      {/* Search Bar - Hide when navigating */}
      {!isNavigating && (
        <>
          <div className="absolute top-[39px] left-[16px] right-[16px] md:left-[30px] md:right-auto md:w-[433px] z-10">
            <div
              className="flex items-center gap-2 px-[18px] py-[18px] bg-white border border-[#EEEEEE] rounded-[272.346px]"
              style={{
                boxShadow: "-91px 60px 44px rgba(163,163,163,0.01), -51px 34px 37px rgba(163,163,163,0.05), -23px 15px 27px rgba(163,163,163,0.09), -6px 4px 15px rgba(163,163,163,0.1)",
              }}
            >
              <Search className="w-[27.55px] h-[27.55px] text-black flex-shrink-0" />
              <Input
                type="text"
                placeholder="Search for restaurant, coffee, shopping..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="flex-1 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-[16px] leading-[37px] text-[#5B5B5B] placeholder:text-[#5B5B5B] h-auto p-0"
              />
            </div>
          </div>

          {/* User Stats Badge - Show if user has routes */}
          {user && userRoutesData?.data && userRoutesData.data.totalRoutes > 0 && (
            <div className="absolute top-[0px] right-[16px] md:right-[30px] z-10">
              <a
                href={`/${locale}/profile/routes`}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-[#EEEEEE] rounded-full shadow-md hover:shadow-lg transition-all group"
              >
                <div className="flex items-center gap-2">
                  <RouteIcon className="w-4 h-4 text-[#007036]" />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-900">
                      {userRoutesData.data.totalRoutes} {userRoutesData.data.totalRoutes === 1 ? 'Route' : 'Routes'}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {userRoutesData.data.totalPoints} pts • {userRoutesData.data.totalDistance.toFixed(1)} km
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#007036] transition-colors" />
              </a>
            </div>
          )}
        </>
      )}

      {/* DEBUG: Test Navigation Button */}
      <div className="absolute top-[120px] left-[16px] md:left-[30px] z-10 space-y-2">


        
        {/* Debug Controls when navigating */}
        {isNavigating && (
          <div className="bg-white border-2 border-[#FF6B00] rounded-lg p-2 space-y-1">
            <div className="text-[10px] font-semibold text-[#FF6B00] mb-1">DEBUG CONTROLS</div>
            <Button
              onClick={() => {
                if (currentStepIndex < routeSteps.length - 1) {
                  setCurrentStepIndex(currentStepIndex + 1);
                }
              }}
              disabled={currentStepIndex >= routeSteps.length - 1}
              size="sm"
              variant="outline"
              className="text-xs h-6 w-full"
            >
              ⏭️ Next Step ({currentStepIndex + 1}/{routeSteps.length})
            </Button>
            <Button
              onClick={() => {
                if (currentStepIndex > 0) {
                  setCurrentStepIndex(currentStepIndex - 1);
                }
              }}
              disabled={currentStepIndex <= 0}
              size="sm"
              variant="outline"
              className="text-xs h-6 w-full"
            >
              ⏮️ Prev Step
            </Button>
            <div className="text-[9px] text-[#5B5B5B] pt-1 border-t">
              Route: {routeInfo?.distance}km • {routeInfo?.duration}min
            </div>
          </div>
        )}
      </div>

      {/* Your Location Button  */}
      <button
        onClick={centerOnUserLocation}
        className="absolute bottom-[39px] right-[16px] md:right-[30px] z-10 flex items-center gap-2 px-[18px] py-[18px] bg-white border border-white rounded-[272.346px] transition-all hover:bg-gray-50"
        style={{
          boxShadow: "-91px 60px 44px rgba(163,163,163,0.01), -51px 34px 37px rgba(163,163,163,0.05), -23px 15px 27px rgba(163,163,163,0.09), -6px 4px 15px rgba(163,163,163,0.1)",
        }}
      >
        <Navigation className="w-6 h-6 text-[#055392]" />
        <span className="font-['Inter'] font-semibold text-[18px] leading-[37px] text-[#055392]">
          Your Location
        </span>
      </button>

      {/* POI List Sidebar  - Hide when navigating */}
      {!isNavigating && (
        <div className="absolute top-[140px] left-[16px] md:left-[30px] w-[calc(100%-32px)] md:w-[465px] max-h-[calc(100%-180px)] z-10 bg-white border-2 border-[#EEEEEE] rounded-[38px] overflow-hidden flex flex-col">
          {!selectedPoiId ? (
          /* POI Cards List */
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {nearbyPois.map((poi, index) => (
              <React.Fragment key={poi.id}>
                {/* POI Card  */}
                <div
                  onClick={() => handlePoiCardClick(poi)}
                  className={cn(
                    "flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors",
                    selectedPoi?.id === poi.id && "bg-gray-100"
                  )}
                >
                  {/* Left Section  */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {/* Image */}
                    <img
                      src={poi.image || "https://placehold.co/100x100?text=POI"}
                      alt={poi.name}
                      className="w-[91px] h-[91px] rounded-[12px] object-cover flex-shrink-0 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewerKind('image');
                        setViewerSrc(poi.image || "https://placehold.co/100x100?text=POI");
                        setViewerOpen(true);
                      }}
                    />

                    {/* POI Info  */}
                    <div className="flex flex-col gap-2 flex-1 min-w-0">
{/* Category */}
<button
  onClick={(e) => {
    e.stopPropagation();
    handleCategoryClick(poi.category);
  }}
  className="font-['Inter'] text-[16px] leading-[19px] text-[#5B5B5B] text-left"
  title={`Filter: ${poi.categoryName}`}
>
  {poi.categoryName} 
</button>

                      {/* Name */}
                      <h3 className="font-['BigNoodleTitling'] text-[24px] leading-[26px] text-black truncate">
                        {poi.name}
                      </h3>

                      {/* Rating  */}
                      <div className="flex items-center gap-2">
                        <Star className="w-[19px] h-[19px] fill-[#007036] text-[#007036]" />
                        <span className="font-['Inter'] text-[16px] leading-[19px] text-[#5B5B5B]">
                          {typeof poi.rating === 'number' && !isNaN(poi.rating) 
                            ? poi.rating.toFixed(1) 
                            : "N/A"} ({poi.reviewCount || 0} reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Action Icons  */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Focus on POI and calculate route
                        handlePoiClick(poi);
                      }}
                      className="w-[49px] h-[49px] rounded-full border border-[#EEEEEE] flex items-center justify-center hover:bg-gray-100 transition-colors"
                      title="Show route to this location"
                    >
                      <ArrowUpRight className="w-6 h-6 text-black" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle share
                        const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
                        const shareText = `Check out ${poi.name}`;
                        
                        if (navigator.share) {
                          navigator.share({
                            title: poi.name,
                            text: shareText,
                            url: shareUrl,
                          }).catch(() => {});
                        } else if (navigator.clipboard) {
                          navigator.clipboard.writeText(shareUrl);
                          alert('Link copied to clipboard!');
                        }
                      }}
                      className="w-[49px] h-[49px] rounded-full border border-[#EEEEEE] bg-white flex items-center justify-center hover:bg-gray-100 transition-colors"
                      title="Share this place"
                    >
                      <Share2 className="w-6 h-6 text-black" />
                    </button>
                  </div>
                </div>

                {/* Divider - Vector */}
                {index < nearbyPois.length - 1 && (
                  <div className="w-full h-px bg-[#EEEEEE] rounded-[13px]" />
                )}
              </React.Fragment>
            ))}
          </div>
        ) : (
          /* POI Details View */
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={handleBackToList}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h4 className="font-['BigNoodleTitling'] text-[20px] leading-[22px]">POI Details</h4>
            </div>
            
            {isFetchingPoi ? (
              <div className="text-sm text-[#5B5B5B]">Loading...</div>
            ) : fetchedPoiData?.poi ? (
              (() => {
                const poi: any = fetchedPoiData.poi;
                const locKey = locale as 'fr' | 'en' | 'ar';
                const locObj = poi?.[`${locKey}Localization`] || poi?.frLocalization || poi?.enLocalization || poi?.arLocalization || null;
                
                const label = locObj?.name || poi?.fr || poi?.en || poi?.ar || 'POI';
                const desc = locObj?.description || '';
                const address = poi?.coordinates?.address || poi?.city?.name || '';
                
                // Images & Videos
                const imageFiles: any[] = Array.isArray(poi.files)
                  ? poi.files.filter((f: any) => String(f?.type || '').toLowerCase() === 'image')
                  : [];
                const videoFiles: any[] = Array.isArray(poi.files)
                  ? poi.files.filter((f: any) => String(f?.type || '').toLowerCase() === 'video')
                  : [];
                const mediaFiles: any[] = [...imageFiles, ...videoFiles];
                
                const primaryImage = poi.initialImage || imageFiles[0]?.fileUrl;
                
                // Virtual tour
                const virtualTour: any = Array.isArray(poi.files)
                  ? poi.files.find((f: any) => String(f?.type || '').toLowerCase() === 'virtualtour')
                  : null;
                
                // Audio
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
                
                // Category
                const parseLoc = (val: any) => {
                  if (!val) return null;
                  if (typeof val === 'string') {
                    try { return JSON.parse(val); } catch { return null; }
                  }
                  return typeof val === 'object' ? val : null;
                };
                const cat = poi?.categoryPOI;
                const catName = parseLoc(cat?.[locKey])?.name || parseLoc(cat?.fr)?.name || parseLoc(cat?.en)?.name || parseLoc(cat?.ar)?.name || '';
                
                // City
                const cityName = locKey === 'ar' ? poi?.city?.nameAr : (locKey === 'en' ? poi?.city?.nameEn : poi?.city?.name);
                const cityImage = poi?.city?.image;
                
                // Rating
                const rating = poi.rating ? Number(poi.rating) : undefined;
                const reviewCount = poi.reviewCount ? Number(poi.reviewCount) : 0;
                
                return (
                  <div className="space-y-3">
                    {/* POI Header  */}
                    <div className="flex items-center gap-[14px]">
                      <div className="flex items-center gap-[5.63px]">
                        {/* Image */}
                        {primaryImage && (
                          <img
                            src={primaryImage}
                            alt={label}
                            className="w-[98px] h-[98px] rounded-[14.0209px] object-cover cursor-pointer"
                            onClick={() => {
                              setViewerKind('image');
                              setViewerSrc(primaryImage);
                              setViewerOpen(true);
                            }}
                          />
                        )}
                        
                        {/* - POI Info */}
                        <div className="flex flex-col justify-center gap-[5.63px] w-[182px]">
                          {/* Frame 108 */}
                          <div className="flex flex-col gap-[6px]">
                            {/* Category */}
                            <p className="font-['Inter'] text-[11.2583px] leading-[14px] text-[#5B5B5B]">
                              {catName || address || 'Category'}
                            </p>
                            
                            {/* POI Name */}
                            <h3 className="font-['BigNoodleTitling'] text-[32px] leading-[35px] tracking-[0.02em] text-black">
                              {label}
                            </h3>
                          </div>
                          
                          {/* Rating  */}
                          <div className="flex items-start gap-[5.63px]">
                            <Star className="w-[11px] h-[10.48px] fill-[#FFCC00] text-[#FFCC00]" />
                            <span className="font-['Inter'] text-[11.2583px] leading-[14px] text-[#5B5B5B]">
                              {rating !== undefined ? rating.toFixed(1) : 'N/A'} ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons  */}
                    <div className="flex items-center gap-[4px] mt-4">
                      {/* Start Navigation Button */}
                      <button
                        onClick={() => {
                          if (routeGeoJSON) {
                            setIsNavigating(true);
                            setIsNavigationPaused(false);
                          }
                        }}
                        disabled={!routeGeoJSON}
                        className={cn(
                          "flex items-center justify-center gap-[11.86px] px-[11.8605px] py-[11.8605px] h-[51px] bg-[#007036] transition-all",
                          "rounded-tl-[20px] rounded-br-[20px]",
                          !routeGeoJSON && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <Navigation className="w-[23.72px] h-[23.72px] text-white" />
                        <span className="font-['Inter'] font-semibold text-[14.2326px] leading-[17px] text-white">
                          Start
                        </span>
                      </button>

                      {/* Transport Mode Selector */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleTransportModeChange('foot')}
                          className={cn(
                            "w-[51px] h-[51px] rounded-full flex items-center justify-center border border-[#EEEEEE] transition-all",
                            transportMode === 'foot' ? "bg-[#007036] text-white border-[#007036]" : "bg-white text-black hover:bg-gray-50"
                          )}
                          title="Walking"
                        >
                          <WalkIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleTransportModeChange('bike')}
                          className={cn(
                            "w-[51px] h-[51px] rounded-full flex items-center justify-center border border-[#EEEEEE] transition-all",
                            transportMode === 'bike' ? "bg-[#007036] text-white border-[#007036]" : "bg-white text-black hover:bg-gray-50"
                          )}
                          title="Bicycle"
                        >
                          <Bike className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleTransportModeChange('motorcycle')}
                          className={cn(
                            "w-[51px] h-[51px] rounded-full flex items-center justify-center border border-[#EEEEEE] transition-all",
                            transportMode === 'motorcycle' ? "bg-[#007036] text-white border-[#007036]" : "bg-white text-black hover:bg-gray-50"
                          )}
                          title="Motorcycle"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.5 6.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5S15.17 8 16 8s1.5-.67 1.5-1.5zM5 12c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5zm14 0c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5zm0-8.5c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm-7.89-2.62l2.39.78 1.83-5.64h-2.05l-1.78 4.86h-3.67L8.4 5.48c-.76-1.18-2.36-1.83-3.81-1.48L2 4.57l.73 1.93.59-.16c.69-.19 1.48.04 1.83.67h5.76z"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => handleTransportModeChange('car')}
                          className={cn(
                            "w-[51px] h-[51px] rounded-full flex items-center justify-center border border-[#EEEEEE] transition-all",
                            transportMode === 'car' ? "bg-[#007036] text-white border-[#007036]" : "bg-white text-black hover:bg-gray-50"
                          )}
                          title="Car"
                        >
                          <Car className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-[#5B5B5B]">{address}</div>
                    </div>
                    
                    {desc && <p className="text-sm leading-relaxed text-foreground/90">{desc}</p>}
                    
                    {audioUrl && (
                      <div className="mt-2">
                        <audio controls className="w-full">
                          <source src={audioUrl} />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    )}
                    
                    {mediaFiles.length > 0 && (
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {mediaFiles.map((f: any, idx: number) => {
                          const fileType = String(f?.type || '').toLowerCase();
                          const isImg = fileType === 'image';
                          const isVid = fileType === 'video';
                          return (
                            <div
                              key={idx}
                              className="w-full aspect-video rounded overflow-hidden border relative cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => {
                                setViewerKind(isImg ? 'image' : 'video');
                                setViewerSrc(f.fileUrl);
                                setViewerOpen(true);
                              }}
                            >
                              {isImg && (
                                <img src={f.fileUrl} alt={label} className="w-full h-full object-cover" />
                              )}
                              {isVid && (
                                <>
                                  <video src={f.fileUrl} className="w-full h-full object-cover" muted playsInline />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-white text-xl">
                                    ▶
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    {virtualTour?.fileUrl && (
                      <div className="mt-3">
                        <iframe
                          src={virtualTour.fileUrl}
                          className="w-full h-56 rounded border"
                          allow="accelerometer; gyroscope; fullscreen"
                        />
                      </div>
                    )}
                    
                    {cat && (
                      <div className="mt-3 flex items-center gap-2">
                        {cat.icon && <img src={cat.icon} alt={catName || 'Category'} className="w-6 h-6 object-contain" />}
                        <div className="text-sm text-[#5B5B5B]">
                          Category:{' '}
                          <button
                            onClick={() => handleCategoryClick((fetchedPoiData?.poi?.category as string) || selectedPoi?.category)}
                            className="font-medium text-black underline"
                            title={`Filter: ${catName}`}
                          >
                            {catName}
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {poi?.city && (
                      <div className="mt-3 flex items-center gap-2">
                        {cityImage && (
                          <img src={cityImage} alt={cityName || 'City'} className="w-10 h-10 rounded object-cover border" />
                        )}
                        <div className="text-sm text-[#5B5B5B]">
                          City: <span className="font-medium text-black">{cityName}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()
            ) : (
              <div className="text-sm text-[#5B5B5B]">No data available</div>
            )}
          </div>
        )}
        </div>
      )}

      {/* Transport Mode Selector - Only show before navigation starts */}
      {routeGeoJSON && !isNavigating && (
        <div className="absolute bottom-[120px] right-[16px] md:right-[30px] z-10 bg-white border-2 border-[#EEEEEE] rounded-full p-2 flex gap-2 shadow-lg">
          <button
            onClick={() => handleTransportModeChange('foot')}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-all",
              transportMode === 'foot' ? "bg-[#007036] text-white" : "bg-white text-black hover:bg-gray-100"
            )}
            title="Walking"
          >
            <WalkIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleTransportModeChange('bike')}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-all",
              transportMode === 'bike' ? "bg-[#007036] text-white" : "bg-white text-black hover:bg-gray-100"
            )}
            title="Bicycle"
          >
            <Bike className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleTransportModeChange('motorcycle')}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-all",
              transportMode === 'motorcycle' ? "bg-[#007036] text-white" : "bg-white text-black hover:bg-gray-100"
            )}
            title="Motorcycle"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.5 6.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5S15.17 8 16 8s1.5-.67 1.5-1.5zM5 12c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5zm14 0c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5zm0-8.5c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm-7.89-2.62l2.39.78 1.83-5.64h-2.05l-1.78 4.86h-3.67L8.4 5.48c-.76-1.18-2.36-1.83-3.81-1.48L2 4.57l.73 1.93.59-.16c.69-.19 1.48.04 1.83.67h5.76z"/>
            </svg>
          </button>
          <button
            onClick={() => handleTransportModeChange('car')}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-all",
              transportMode === 'car' ? "bg-[#007036] text-white" : "bg-white text-black hover:bg-gray-100"
            )}
            title="Car"
          >
            <Car className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Route Info & Start Navigation - Desktop */}
      {routeGeoJSON && routeInfo && !isNavigating && (
        <div className="hidden md:block absolute bottom-[39px] left-1/2 -translate-x-1/2 z-10">
          <div className="bg-white border-2 border-[#EEEEEE] rounded-[38px] px-6 py-4 flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-[#007036]" />
              <div className="text-sm">
                <span className="font-semibold">{routeInfo.duration}min</span>
                <span className="text-[#5B5B5B] ml-1">- {routeInfo.distance} Km</span>
              </div>
            </div>
            <Button
              onClick={handleStartNavigation}
              className="bg-[#007036] hover:bg-[#005a2b] text-white rounded-full px-6"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Start Navigation
            </Button>
          </div>
        </div>
      )}

      {/* Route Info & Start Navigation - Mobile */}
      {routeGeoJSON && routeInfo && !isNavigating && (
        <div className="md:hidden absolute bottom-[39px] left-[16px] right-[16px] z-10">
          <div className="bg-white border-2 border-[#EEEEEE] rounded-[38px] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#007036]" />
              <span className="text-sm font-semibold">{routeInfo.duration}min - {routeInfo.distance} Km</span>
            </div>
            <Button
              onClick={handleStartNavigation}
              size="sm"
              className="bg-[#007036] hover:bg-[#005a2b] text-white rounded-full"
            >
              <Navigation className="w-3 h-3 mr-1" />
              Start
            </Button>
          </div>
        </div>
      )}

      {/* Navigation Panel - Desktop */}
      {isNavigating && routeSteps.length > 0 && (
        <div className="hidden md:block absolute top-[39px] right-[30px] w-[400px] z-10 bg-white border-2 border-[#EEEEEE] rounded-[38px] overflow-hidden">
          <div className="p-6 space-y-4">
            {/* Audio Player - Show at top if available */}
            {getPoiAudioUrl() && (
              <div className="bg-[#F5F5F5] rounded-2xl p-3">
                <div className="text-xs text-[#5B5B5B] mb-2 font-medium">POI Audio Guide</div>
                <audio controls className="w-full h-8">
                  <source src={getPoiAudioUrl()!} />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#007036] rounded-full flex items-center justify-center">
                  <Navigation className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm text-[#5B5B5B]">Arriving in</div>
                  <div className="font-semibold text-lg">{routeInfo?.duration} min</div>
                </div>
              </div>
            </div>

            {/* Current Step */}
            {routeSteps[currentStepIndex] && (
              <div className="bg-[#F5F5F5] rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#007036] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <ArrowLeft className={cn(
                      "w-4 h-4 text-white",
                      routeSteps[currentStepIndex].modifier === 'right' && "rotate-180",
                      routeSteps[currentStepIndex].modifier === 'straight' && "rotate-90"
                    )} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-base mb-1">
                      {routeSteps[currentStepIndex].instruction}
                    </p>
                    <p className="text-sm text-[#5B5B5B]">
                      in {Math.round(routeSteps[currentStepIndex].distance)}m
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Distance & Time */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <RouteIcon className="w-4 h-4 text-[#5B5B5B]" />
                <span className="text-[#5B5B5B]">{routeInfo?.distance} Km</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#5B5B5B]" />
                <span className="text-[#5B5B5B]">{routeInfo?.duration} min</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handlePauseNavigation}
                variant="outline"
                className="flex-1 rounded-full"
              >
                {isNavigationPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
                {isNavigationPaused ? 'Resume' : 'Pause'}
              </Button>
              <Button
                onClick={handleReroute}
                variant="outline"
                className="flex-1 rounded-full"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reroute
              </Button>
            </div>

            {/* Transport Mode Selector */}
            <div className="flex items-center justify-center gap-2 p-2 bg-[#F5F5F5] rounded-2xl">
              <button
                onClick={() => handleTransportModeChange('foot')}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                  transportMode === 'foot' ? "bg-[#007036] text-white" : "bg-white text-black hover:bg-gray-100"
                )}
                title="Walking"
              >
                <WalkIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleTransportModeChange('bike')}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                  transportMode === 'bike' ? "bg-[#007036] text-white" : "bg-white text-black hover:bg-gray-100"
                )}
                title="Bicycle"
              >
                <Bike className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleTransportModeChange('motorcycle')}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                  transportMode === 'motorcycle' ? "bg-[#007036] text-white" : "bg-white text-black hover:bg-gray-100"
                )}
                title="Motorcycle"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.5 6.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5S15.17 8 16 8s1.5-.67 1.5-1.5zM5 12c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5zm14 0c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5zm0-8.5c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm-7.89-2.62l2.39.78 1.83-5.64h-2.05l-1.78 4.86h-3.67L8.4 5.48c-.76-1.18-2.36-1.83-3.81-1.48L2 4.57l.73 1.93.59-.16c.69-.19 1.48.04 1.83.67h5.76z"/>
                </svg>
              </button>
              <button
                onClick={() => handleTransportModeChange('car')}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                  transportMode === 'car' ? "bg-[#007036] text-white" : "bg-white text-black hover:bg-gray-100"
                )}
                title="Car"
              >
                <Car className="w-4 h-4" />
              </button>
            </div>

            {/* End Navigation Button - Red */}
            <Button
              onClick={handleEndNavigation}
              className="w-full rounded-full bg-red-600 hover:bg-red-700 text-white"
            >
              <X className="w-4 h-4 mr-2" />
              End Navigation
            </Button>
          </div>
        </div>
      )}

      {/* Navigation Panel - Mobile (Simplified like Google Maps) */}
      {isNavigating && routeSteps.length > 0 && (
        <div className="md:hidden absolute top-[39px] left-[16px] right-[16px] z-10 bg-white border-2 border-[#EEEEEE] rounded-[24px] overflow-hidden">
          <div className="p-4 space-y-3">
            {/* Audio Player - Show at top if available */}
            {getPoiAudioUrl() && (
              <div className="bg-[#F5F5F5] rounded-xl p-2">
                <div className="text-xs text-[#5B5B5B] mb-1 font-medium">POI Audio</div>
                <audio controls className="w-full h-7">
                  <source src={getPoiAudioUrl()!} />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}

            {/* Current Step - Large and prominent */}
            {routeSteps[currentStepIndex] && (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#007036] rounded-full flex items-center justify-center flex-shrink-0">
                  <ArrowLeft className={cn(
                    "w-6 h-6 text-white",
                    routeSteps[currentStepIndex].modifier === 'right' && "rotate-180",
                    routeSteps[currentStepIndex].modifier === 'straight' && "rotate-90"
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg leading-tight mb-1">
                    {routeSteps[currentStepIndex].instruction}
                  </p>
                  <p className="text-sm text-[#5B5B5B]">
                    in {Math.round(routeSteps[currentStepIndex].distance)}m
                  </p>
                </div>
                <button
                  onClick={handleEndNavigation}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Bottom info bar */}
            <div className="flex items-center justify-between pt-2 border-t border-[#EEEEEE]">
              <div className="flex items-center gap-4 text-sm">
                <span className="font-semibold">{routeInfo?.distance} Km</span>
                <span className="text-[#5B5B5B]">{routeInfo?.duration} min</span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={handlePauseNavigation}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
                  title={isNavigationPaused ? 'Resume' : 'Pause'}
                >
                  {isNavigationPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleReroute}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
                  title="Reroute"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Transport Mode Selector - Mobile */}
            <div className="flex items-center justify-center gap-1.5 p-1.5 bg-[#F5F5F5] rounded-xl">
              <button
                onClick={() => handleTransportModeChange('foot')}
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center transition-all",
                  transportMode === 'foot' ? "bg-[#007036] text-white" : "bg-white text-black hover:bg-gray-100"
                )}
                title="Walking"
              >
                <WalkIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleTransportModeChange('bike')}
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center transition-all",
                  transportMode === 'bike' ? "bg-[#007036] text-white" : "bg-white text-black hover:bg-gray-100"
                )}
                title="Bicycle"
              >
                <Bike className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleTransportModeChange('motorcycle')}
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center transition-all",
                  transportMode === 'motorcycle' ? "bg-[#007036] text-white" : "bg-white text-black hover:bg-gray-100"
                )}
                title="Motorcycle"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.5 6.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5S15.17 8 16 8s1.5-.67 1.5-1.5zM5 12c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5zm14 0c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5zm0-8.5c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm-7.89-2.62l2.39.78 1.83-5.64h-2.05l-1.78 4.86h-3.67L8.4 5.48c-.76-1.18-2.36-1.83-3.81-1.48L2 4.57l.73 1.93.59-.16c.69-.19 1.48.04 1.83.67h5.76z"/>
                </svg>
              </button>
              <button
                onClick={() => handleTransportModeChange('car')}
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center transition-all",
                  transportMode === 'car' ? "bg-[#007036] text-white" : "bg-white text-black hover:bg-gray-100"
                )}
                title="Car"
              >
                <Car className="w-4 h-4" />
              </button>
            </div>

            {/* End Navigation Button - Red */}
            <Button
              onClick={handleEndNavigation}
              className="w-full rounded-full bg-red-600 hover:bg-red-700 text-white"
              size="sm"
            >
              <X className="w-3 h-3 mr-1" />
              End Navigation
            </Button>
          </div>
        </div>
      )}

      {/* Viewer popup (image / video) - Outside main container for proper z-index */}
      {viewerOpen && viewerSrc && (
        <div
          className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-4"
          onClick={() => { setViewerOpen(false); setViewerSrc(null); }}
        >
          <div
            className="relative bg-white rounded-lg w-full max-w-3xl max-h-[85vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute top-2 right-2 z-10 px-3 py-1 rounded-md bg-black/60 text-white text-sm"
              onClick={() => { setViewerOpen(false); setViewerSrc(null); }}
            >
              ×
            </button>
            {viewerKind === 'image' ? (
              <img src={viewerSrc} alt="media" className="w-full h-auto max-h-[85vh] object-contain" />
            ) : (
              <video src={viewerSrc} className="w-full h-auto max-h-[85vh]" controls autoPlay playsInline />
            )}
          </div>
        </div>
      )}

      {/* Arrival Popup - You've Arrived! */}
      {showArrivalPopup && (
        <div className="fixed inset-0 z-[10000] bg-black/70 flex items-center justify-center p-4">
          <div
            className="relative bg-white rounded-[20px] md:rounded-[32px] w-full max-w-[90%] md:max-w-[600px] lg:max-w-[723px] p-6 md:p-8 lg:p-10 max-h-[90vh] overflow-y-auto"
            style={{
              boxShadow: "-46px -309px 124px rgba(207, 207, 207, 0.01), -26px -175px 106px rgba(207, 207, 207, 0.05), -12px -78px 78px rgba(207, 207, 207, 0.09), -2px -20px 42px rgba(207, 207, 207, 0.1)",
            }}
          >
            {/* Content Container */}
            <div className="flex flex-col items-center gap-10 md:gap-16 lg:gap-[100px]">
              {/* Top Section - Success Message & Rewards */}
              <div className="flex flex-col items-center gap-4 md:gap-6 lg:gap-8 w-full">
                {/* Success Icon */}
                <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 relative">
                  <CheckCircle2 className="w-full h-full text-[#007036]" strokeWidth={2} />
                </div>

                {/* Text Content */}
                <div className="flex flex-col items-center gap-3 md:gap-4 w-full">
                  {/* Title */}
                  <h2 className="font-['Inter'] font-semibold text-[28px] md:text-[36px] lg:text-[48px] leading-tight text-center text-black">
                    You've Arrived
                  </h2>

                  {/* Subtitle */}
                  <p className="font-['Inter'] font-normal text-[16px] md:text-[20px] lg:text-[28px] leading-tight text-center text-[#5B5B5B]">
                    You have reached your destination safely
                  </p>

                  {/* Reward Points */}
                  <div className="flex flex-wrap items-center justify-center gap-1 md:gap-2">
                    <span className="font-['Inter'] font-normal text-[16px] md:text-[20px] lg:text-[28px] leading-tight text-[#5B5B5B]">
                      You have earned
                    </span>
                    <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 flex items-center justify-center">
                      <svg className="w-full h-full" viewBox="0 0 48 48" fill="none">
                        <circle cx="24" cy="24" r="20" fill="#FFD700" stroke="#FFA500" strokeWidth="2"/>
                        <text x="24" y="30" textAnchor="middle" fill="#000" fontSize="20" fontWeight="bold">$</text>
                      </svg>
                    </div>
                    <span className="font-['Inter'] font-bold text-[16px] md:text-[20px] lg:text-[28px] leading-tight text-[#5B5B5B]">
                      {rewardPoints} reward points.
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 md:gap-4 lg:gap-[26px] w-full">
                {/* First Row - Save Route & Share */}
                <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-[14px] w-full">
                  <button
                    onClick={handleSaveRoute}
                    className="w-full sm:flex-1 flex items-center justify-center gap-3 md:gap-4 lg:gap-5 px-4 md:px-6 lg:px-9 py-3 md:py-4 lg:py-5 h-[60px] md:h-[70px] lg:h-[86px] border-2 border-[#EEEEEE] rounded-full hover:bg-gray-50 transition-colors"
                  >
                    <Bookmark className="w-6 h-6 md:w-8 md:h-8 lg:w-12 lg:h-12 text-[#5B5B5B] flex-shrink-0" strokeWidth={2} />
                    <span className="font-['Inter'] font-semibold text-[14px] md:text-[18px] lg:text-[24px] leading-tight text-center text-[#5B5B5B]">
                      Save Route
                    </span>
                  </button>

                  <button
                    onClick={handleShareRoute}
                    className="w-full sm:flex-1 flex items-center justify-center gap-3 md:gap-4 lg:gap-5 px-4 md:px-6 lg:px-9 py-3 md:py-4 lg:py-5 h-[60px] md:h-[70px] lg:h-[86px] border-2 border-[#EEEEEE] rounded-full hover:bg-gray-50 transition-colors"
                  >
                    <Share2 className="w-6 h-6 md:w-8 md:h-8 lg:w-12 lg:h-12 text-[#5B5B5B] flex-shrink-0" strokeWidth={2} />
                    <span className="font-['Inter'] font-semibold text-[14px] md:text-[18px] lg:text-[24px] leading-tight text-center text-[#5B5B5B]">
                      Share
                    </span>
                  </button>
                </div>

                {/* Second Row - Back to Home & Reverse Route */}
                <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-[14px] w-full">
                  <button
                    onClick={handleBackToHome}
                    className="w-full sm:flex-1 flex items-center justify-center gap-3 md:gap-4 lg:gap-5 px-4 md:px-6 lg:px-9 py-3 md:py-4 lg:py-5 h-[60px] md:h-[70px] lg:h-[86px] border-2 border-[#EEEEEE] rounded-full hover:bg-gray-50 transition-colors"
                  >
                    <Home className="w-6 h-6 md:w-8 md:h-8 lg:w-12 lg:h-12 text-[#5B5B5B] flex-shrink-0" strokeWidth={2} />
                    <span className="font-['Inter'] font-semibold text-[14px] md:text-[18px] lg:text-[24px] leading-tight text-center text-[#5B5B5B]">
                      Back to Home
                    </span>
                  </button>

                  <button
                    onClick={handleReverseRoute}
                    className="w-full sm:flex-1 flex items-center justify-center gap-3 md:gap-4 lg:gap-5 px-4 md:px-6 lg:px-9 py-3 md:py-4 lg:py-5 h-[60px] md:h-[70px] lg:h-[86px] border-2 border-[#EEEEEE] rounded-full hover:bg-gray-50 transition-colors"
                  >
                    <RotateCcw className="w-6 h-6 md:w-8 md:h-8 lg:w-12 lg:h-12 text-[#5B5B5B] flex-shrink-0" strokeWidth={2} />
                    <span className="font-['Inter'] font-semibold text-[14px] md:text-[18px] lg:text-[24px] leading-tight text-center text-[#5B5B5B]">
                      Reverse Route
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button - Circuit Navigation */}
      {!selectedPoiId && !isNavigating && (
        <div className="fixed bottom-24 right-6 z-[999] flex flex-col gap-3">
          {/* User Routes History Button */}
          {user && (
            <a
              href={`/${locale}/profile/routes`}
              className="group bg-white shadow-lg rounded-full p-4 hover:bg-[#007036] transition-all duration-200 border border-gray-200"
              title="My Routes"
            >
              <RouteIcon className="w-6 h-6 text-[#007036] group-hover:text-white transition-colors" />
            </a>
          )}
          
          {/* Circuit Navigation Button */}
          <a
            href={`/${locale}/circuits`}
            className="group bg-[#007036] shadow-lg rounded-full p-4 hover:bg-[#005a2b] transition-all duration-200 flex items-center gap-2"
            title="Start Circuit Navigation"
          >
            <MapIcon className="w-6 h-6 text-white" />
            <span className="text-white font-medium text-sm whitespace-nowrap pr-2 hidden group-hover:inline-block">
              Circuits
            </span>
          </a>
        </div>
      )}

      {/* LOGIN REQUIRED OVERLAY */}
      {!user && !isLoginProcessing &&(
        <div className="absolute inset-0 z-[40] bg-black/20 backdrop-blur-sm flex flex-col items-center justify-center rounded-[38.209px]">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-5 text-center max-w-md mx-4 border border-[#EEEEEE]">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-[#5B5B5B]" />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-['BigNoodleTitling'] text-2xl tracking-wide text-black">Login Required</h3>
              <p className="text-[#5B5B5B] text-sm leading-relaxed">
                Please log in to access the interactive map, view routes, and discover places around you.
              </p>
            </div>

<Button 
  onClick={handleTriggerLogin} 
  className="w-full bg-[#007036] hover:bg-[#005a2b] text-white rounded-full h-[50px] text-base font-semibold gap-2"
>
  <LogIn className="w-5 h-5" />
  Log In to Continue
</Button>
          </div>
        </div>
      )}
    </div>
  );
}