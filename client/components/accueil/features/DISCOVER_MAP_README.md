# Discover Map Section

## Overview
This component provides an interactive map experience for discovering Points of Interest (POIs) in Fez in real-time. It follows the Figma design specifications and includes:

- **Live User Location**: Shows the user's current position with an animated pulse effect
- **POI Markers**: Displays POI locations on the map with images
- **Category Filters**: Filter POIs by category (History & Heritage, Traditional Crafts, Gastronomy, etc.)
- **Search Functionality**: Search for specific POIs
- **Route Drawing**: Calculates and displays walking routes from user location to selected POI
- **POI Sidebar**: Lists nearby POIs with details (image, name, rating, reviews)
- **Interactive Features**: Click POI markers or cards to view routes and details

## Components

### DiscoverMapSection.tsx
Main component that:
- Fetches POIs and categories from the API
- Manages category filtering and search
- Gets user's geolocation
- Renders the map component

### InteractiveMap.tsx
Interactive map component that:
- Displays a MapLibre GL map with Fez centered
- Shows POI markers with images
- Displays user location with animated pulse
- Calculates walking routes using OSRM
- Shows nearby POIs in a sidebar
- Handles POI selection and routing

## Features

### User Location Tracking
- Automatically requests user's geolocation
- Displays user position with animated pulse effect matching Figma design
- Fallback to Fez center if location access is denied

### POI Display
- Shows POIs as circular markers with images
- Border styling matches Figma specs (5px white border, rounded corners)
- Hover and selected states with scale animation
- Click to select and calculate route

### Route Calculation
- Uses OpenStreetMap Routing Service (OSRM) for pedestrian routes
- Draws route with blue line (#055392) and black border
- Automatically fits map bounds to show entire route
- Smooth animation when route is calculated

### Search & Filters
- Category pills matching Figma design (rounded, with icons)
- Real-time search for POI names
- "View all" button to reset filters

### POI Sidebar
- Shows top 4 nearby POIs
- Each card displays:
  - POI image
  - Category
  - Name (BigNoodleTitling font)
  - Rating with star icon
  - Review count
  - Favorite and Share buttons
- Click card to navigate map and calculate route

### Styling
All styling matches Figma specifications:
- Border radius: 38px for main container, 145.588px for pills
- Font families: BigNoodleTitling for titles, Inter for text
- Colors: #007036 (green), #055392 (blue), #5B5B5B (gray text)
- Shadows: Multi-layer shadows as per Figma
- Dimensions: Exact pixel dimensions from Figma

## Usage

```tsx
import DiscoverMapSection from "@/components/accueil/features/DiscoverMapSection";

<DiscoverMapSection locale={locale} isRTL={isRTL} />
```

## Dependencies
- react-map-gl/maplibre: Map rendering
- maplibre-gl: Map library
- lucide-react: Icons
- OpenStreetMap OSRM: Route calculation

## Translations
Add to your locale files (en.json, fr.json, ar.json):

```json
"discoverMap": {
  "title": "Discover Fez in Real Time",
  "searchPlaceholder": "Search for restaurant, coffee, shopping...",
  "yourLocation": "Your Location"
}
```

## API Requirements
- POIs must have coordinates in format: `{ latitude, longitude }` or GeoJSON
- POIs should have files array with images
- Categories should have icon URLs
- Localized data for multi-language support

## Browser Compatibility
- Requires WebGL for map rendering
- Geolocation API for user location
- Modern browsers (Chrome, Firefox, Safari, Edge)
