

import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useEffect, useRef } from "react"

const SAMPLE_PLACES = [
  {
    id: 1,
    name: "Central Park",
    lat: 40.7829,
    lng: -73.9654,
    category: "parks",
    rating: 4.8,
    image: "/central-park-autumn.png",
  },
  {
    id: 2,
    name: "Times Square",
    lat: 40.758,
    lng: -73.9855,
    category: "landmarks",
    rating: 4.5,
    image: "/times-square-bustle.png",
  },
  {
    id: 3,
    name: "Brooklyn Bridge",
    lat: 40.7061,
    lng: -73.9969,
    category: "landmarks",
    rating: 4.9,
    image: "/brooklyn-bridge-cityscape.png",
  },
  {
    id: 4,
    name: "High Line",
    lat: 40.7505,
    lng: -74.0021,
    category: "parks",
    rating: 4.7,
    image: "/high-line.jpg",
  },
  {
    id: 5,
    name: "Empire State Building",
    lat: 40.7484,
    lng: -73.9857,
    category: "landmarks",
    rating: 4.6,
    image: "/empire-state-building.png",
  },
  {
    id: 6,
    name: "Statue of Liberty",
    lat: 40.6892,
    lng: -74.0445,
    category: "landmarks",
    rating: 4.8,
    image: "/statue-of-liberty.png",
  },
  {
    id: 7,
    name: "Madison Square Park",
    lat: 40.7454,
    lng: -73.9881,
    category: "parks",
    rating: 4.6,
    image: "/madison-square-park.jpg",
  },
]

const createMarkerIcon = (category, isSelected) => {
  const colors = {
    parks: "#10b981",
    landmarks: "#3b82f6",
    restaurants: "#f59e0b",
    museums: "#8b5cf6",
  }

  const color = colors[category] || "#6b7280"
  const size = isSelected ? 40 : 32

  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        cursor: pointer;
        transition: all 0.2s;
        font-weight: bold;
        color: white;
        font-size: 18px;
      ">
        📍
      </div>
    `,
    iconSize: [size, size],
    className: "custom-marker",
  })
}

export default function MapScreen({ selectedPlace, filter, onPlaceSelect }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef({})

  useEffect(() => {
    if (!mapRef.current) return

    // Initialize map
    const map = L.map(mapRef.current).setView([40.7128, -74.006], 12)

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map)

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove())
    markersRef.current = {}

    // Add markers
    const filteredPlaces = filter === "all" ? SAMPLE_PLACES : SAMPLE_PLACES.filter((p) => p.category === filter)

    filteredPlaces.forEach((place) => {
      const isSelected = selectedPlace?.id === place.id
      const marker = L.marker([place.lat, place.lng], {
        icon: createMarkerIcon(place.category, isSelected),
      }).addTo(map)

      const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 16px;">${place.name}</h3>
          <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 8px;">
            <span style="color: #f59e0b;">⭐</span>
            <span style="font-weight: 600;">${place.rating}</span>
            <span style="color: #6b7280; font-size: 14px;">(${Math.floor(Math.random() * 500) + 50} reviews)</span>
          </div>
          <p style="margin: 0; color: #6b7280; font-size: 14px; text-transform: capitalize;">${place.category}</p>
        </div>
      `

      marker.bindPopup(popupContent)
      marker.on("click", () => {
        if (onPlaceSelect) onPlaceSelect(place)
      })

      markersRef.current[place.id] = marker
    })

    mapInstanceRef.current = map

    return () => {
      map.remove()
    }
  }, [filter, selectedPlace, onPlaceSelect])

  return <div ref={mapRef} className="w-full h-full rounded-t-2xl" />
}
