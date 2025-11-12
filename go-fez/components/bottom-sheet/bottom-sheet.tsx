
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Clock, Globe, Heart, MapPin, Phone, Share2, Star } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const NEARBY_PLACES = [
  {
    id: 1,
    name: "Central Park",
    distance: "0.5 km",
    rating: 4.8,
    category: "Parks",
    description: "A large public park in the heart of Manhattan",
    phone: "+1 (212) 310-6600",
    website: "centralparknyc.org",
    hours: "6 AM - 1 AM",
    image: "/central-park-autumn.png",
  },
  {
    id: 2,
    name: "Times Square",
    distance: "1.2 km",
    rating: 4.5,
    category: "Landmarks",
    description: "Famous intersection and commercial hub",
    phone: "+1 (212) 768-1560",
    website: "timessquarenyc.org",
    hours: "24/7",
    image: "/times-square-bustle.png",
  },
  {
    id: 3,
    name: "Brooklyn Bridge",
    distance: "2.1 km",
    rating: 4.9,
    category: "Landmarks",
    description: "Iconic bridge connecting Manhattan and Brooklyn",
    phone: "+1 (212) 310-6600",
    website: "nycgo.com",
    hours: "24/7",
    image: "/brooklyn-bridge-cityscape.png",
  },
]

const SNAP_POINTS = [0.3, 0.6, 1]

export default function BottomSheet({ place, onPlaceSelect }) {
  const [snapPoint, setSnapPoint] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startY, setStartY] = useState(0)
  const sheetRef = useRef(null)
  const contentRef = useRef(null)

  const getHeight = () => {
    const windowHeight = typeof window !== "undefined" ? window.innerHeight : 800
    return SNAP_POINTS[snapPoint] * windowHeight
  }

  const handleMouseDown = (e) => {
    setIsDragging(true)
    setStartY(e.clientY)
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return

    const diff = startY - e.clientY
    const currentHeight = getHeight()
    const windowHeight = typeof window !== "undefined" ? window.innerHeight : 800
    const newHeight = currentHeight + diff

    let newSnapPoint = snapPoint
    for (let i = 0; i < SNAP_POINTS.length; i++) {
      if (Math.abs(newHeight - SNAP_POINTS[i] * windowHeight) < 50) {
        newSnapPoint = i
        break
      }
    }

    if (newSnapPoint !== snapPoint) {
      setSnapPoint(newSnapPoint)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
      return () => {
        window.removeEventListener("mousemove", handleMouseMove)
        window.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, snapPoint])

  const currentPlace = place || NEARBY_PLACES[0]
  const height = getHeight()

  return (
    <div
      ref={sheetRef}
      className="fixed bottom-0 left-0 right-0 bg-card rounded-t-3xl shadow-2xl transition-all duration-300 ease-out"
      style={{ height: `${height}px` }}
    >
      {/* Handle Bar */}
      <div
        className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing border-b border-border"
        onMouseDown={handleMouseDown}
      >
        <div className="w-12 h-1 bg-muted rounded-full" />
      </div>

      {/* Content */}
      <div ref={contentRef} className="px-4 pb-4 overflow-y-auto h-[calc(100%-44px)]">
        {/* Place Header */}
        <div className="flex items-start justify-between mt-4 mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground">{currentPlace.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">{currentPlace.category}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Heart className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Rating and Distance */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{currentPlace.rating}</span>
            <span className="text-sm text-muted-foreground">(248 reviews)</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{currentPlace.distance}</span>
          </div>
        </div>

        {/* Description */}
        {snapPoint > 0 && (
          <>
            <p className="text-sm text-foreground mb-4 leading-relaxed">{currentPlace.description}</p>

            {/* Info Cards */}
            <div className="space-y-3 mb-4">
              <Card className="p-3 flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Hours</p>
                  <p className="text-sm font-medium">{currentPlace.hours}</p>
                </div>
              </Card>

              <Card className="p-3 flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium">{currentPlace.phone}</p>
                </div>
              </Card>

              <Card className="p-3 flex items-center gap-3">
                <Globe className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Website</p>
                  <p className="text-sm font-medium text-blue-500">{currentPlace.website}</p>
                </div>
              </Card>
            </div>
          </>
        )}

        {/* Nearby Places List */}
        {snapPoint > 0.5 && (
          <>
            <h3 className="text-lg font-bold mb-3 mt-6">Nearby Places</h3>
            <div className="space-y-3">
              {NEARBY_PLACES.map((p) => (
                <Card
                  key={p.id}
                  className="p-3 cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => onPlaceSelect(p)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{p.name}</h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {p.distance}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-medium">{p.rating}</span>
                      </div>
                    </div>
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full whitespace-nowrap">
                      {p.category}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Action Buttons */}
        {snapPoint > 0 && (
          <div className="flex gap-3 mt-6 mb-4">
            <Button className="flex-1" size="lg">
              Get Directions
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent" size="lg">
              Save
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
