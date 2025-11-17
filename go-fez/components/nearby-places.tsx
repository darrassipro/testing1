

import { Card } from "@/components/ui/card"
import { Clock, Star } from "lucide-react"

const NEARBY_PLACES = [
  {
    id: 1,
    name: "Central Park",
    distance: "0.5 km",
    rating: 4.8,
    category: "Parks",
    image: "/central-park-autumn.png",
    reviews: 248,
    hours: "6 AM - 1 AM",
  },
  {
    id: 2,
    name: "Times Square",
    distance: "1.2 km",
    rating: 4.5,
    category: "Landmarks",
    image: "/times-square-bustle.png",
    reviews: 512,
    hours: "24/7",
  },
  {
    id: 3,
    name: "Brooklyn Bridge",
    distance: "2.1 km",
    rating: 4.9,
    category: "Landmarks",
    image: "/brooklyn-bridge-cityscape.png",
    reviews: 389,
    hours: "24/7",
  },
  {
    id: 4,
    name: "High Line",
    distance: "1.8 km",
    rating: 4.7,
    category: "Parks",
    image: "/high-line.jpg",
    reviews: 156,
    hours: "7 AM - 11 PM",
  },
]

export default function NearbyPlaces({ onPlaceSelect }) {
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">Nearby Places</h2>
        <button className="text-sm text-primary hover:underline">See All</button>
      </div>

      <div className="space-y-3">
        {NEARBY_PLACES.map((place) => (
          <Card
            key={place.id}
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-all"
            onClick={() => onPlaceSelect?.(place)}
          >
            <div className="flex gap-3 p-3">
              {/* Image */}
              <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                <img src={place.image || "/placeholder.svg"} alt={place.name} className="w-full h-full object-cover" />
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{place.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{place.category}</p>
                    </div>
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full whitespace-nowrap">
                      {place.distance}
                    </span>
                  </div>
                </div>

                {/* Rating and Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-semibold">{place.rating}</span>
                    <span className="text-xs text-muted-foreground">({place.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {place.hours}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
