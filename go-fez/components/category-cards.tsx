

import { Card } from "@/components/ui/card"
import { Building2, MapPin, Palette, TrendingUp, Utensils } from "lucide-react"

const CATEGORIES = [
  {
    id: 1,
    name: "Parks",
    icon: Palette,
    count: 24,
    color: "bg-emerald-100 text-emerald-700",
    borderColor: "border-emerald-200",
  },
  {
    id: 2,
    name: "Restaurants",
    icon: Utensils,
    count: 156,
    color: "bg-orange-100 text-orange-700",
    borderColor: "border-orange-200",
  },
  {
    id: 3,
    name: "Landmarks",
    icon: Building2,
    count: 42,
    color: "bg-blue-100 text-blue-700",
    borderColor: "border-blue-200",
  },
  {
    id: 4,
    name: "Museums",
    icon: MapPin,
    count: 18,
    color: "bg-blue-100 text-blue-700",
    borderColor: "border-blue-200",
  },
]

export default function CategoryCards({ onCategorySelect }) {
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">Popular Categories</h2>
        <button className="text-sm text-primary hover:underline flex items-center gap-1">
          <TrendingUp className="w-4 h-4" />
          View All
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((category) => {
          const Icon = category.icon

          return (
            <Card
              key={category.id}
              className={`p-4 cursor-pointer hover:shadow-md transition-all border-2 ${category.borderColor}`}
              onClick={() => onCategorySelect?.(category.id)}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${category.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-foreground text-sm">{category.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{category.count} places</p>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
