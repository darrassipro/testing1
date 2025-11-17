

import { Button } from "@/components/ui/button"
import { Building2, MapPin, Palette, Utensils } from "lucide-react"

const FILTERS = [
  { id: "all", label: "All", icon: MapPin },
  { id: "parks", label: "Parks", icon: Palette },
  { id: "landmarks", label: "Landmarks", icon: Building2 },
  { id: "restaurants", label: "Restaurants", icon: Utensils },
]

export default function FilterTabs({ activeFilter, onFilterChange }) {
  return (
    <div className="bg-background border-b border-border p-3 overflow-x-auto">
      <div className="flex gap-2">
        {FILTERS.map((filter) => {
          const Icon = filter.icon
          const isActive = activeFilter === filter.id

          return (
            <Button
              key={filter.id}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => onFilterChange(filter.id)}
              className={`whitespace-nowrap flex items-center gap-2 transition-all ${
                isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              <Icon className="w-4 h-4" />
              {filter.label}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
