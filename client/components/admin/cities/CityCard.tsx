'use client';

import { useState } from 'react';
import ImagePreview from '../shared/ImagePreview';
import { StatusBadge } from '../shared/StatusBadge';
import { ActionButtons } from '../shared/ActionButtons';
import { MapPin, Globe, X, Eye, Calendar, Info, Map, Navigation } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';


interface CityCardProps {
  city: any;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

const mapContainerStyle = {
  width: '100%',
  height: '500px',
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: true,
  fullscreenControl: true,
};

const circleOptions = {
  strokeColor: '#8B5CF6',
  strokeOpacity: 0.8,
  strokeWeight: 2,
  fillColor: '#8B5CF6',
  fillOpacity: 0.15,
};

export function CityCard({ city, onEdit, onDelete, isDeleting }: CityCardProps) {
  const [showModal, setShowModal] = useState(false);

  // Get current location from city coordinates
  const currentLocation = city.coordinates?.latitude && city.coordinates?.longitude
    ? {
        lat: city.coordinates.latitude,
        lng: city.coordinates.longitude,
      }
    : null;

  // Calculate zoom level based on radius
  const getZoomLevel = (radius: number) => {
    if (radius <= 5) return 13;
    if (radius <= 10) return 12;
    if (radius <= 20) return 11;
    if (radius <= 50) return 10;
    return 9;
  };

  const zoomLevel = city.radius ? getZoomLevel(city.radius) : 12;

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-100">
        <ImagePreview 
          src={city.image} 
          alt={city.name || 'Ville'} 
          className="w-full h-48" 
        />
        
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-bold text-lg text-gray-900 mb-1">{city.name || 'Sans nom'}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Globe className="w-4 h-4" />
              <span>{city.country}</span>
            </div>
          </div>

          <div className="text-sm text-gray-500 space-y-2">
            {/* Noms multilingues */}
            <div className="bg-gray-50 p-2 rounded">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <strong className="text-gray-700">FR:</strong>
                  <p className="truncate">{city.name}</p>
                </div>
                <div>
                  <strong className="text-gray-700">AR:</strong>
                  <p className="truncate">{city.nameAr}</p>
                </div>
                <div>
                  <strong className="text-gray-700">EN:</strong>
                  <p className="truncate">{city.nameEn}</p>
                </div>
              </div>
            </div>

            {/* Coordonnées */}
            {city.coordinates && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                    <strong>Lat:</strong> {city.coordinates.latitude?.toFixed(4)}{' '}
                    <strong>Lng:</strong> {city.coordinates.longitude?.toFixed(4)}
                  </div>
                  {city.coordinates.address && (
                    <p className="text-xs text-gray-600 mt-1 truncate">
                      {city.coordinates.address}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Rayon */}
            <div className="flex items-center gap-2">
              <span>📍</span>
              <strong>Rayon:</strong>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                {city.radius} km
              </span>
            </div>
          </div>

          {/* Detail Button */}
          <button
            onClick={() => setShowModal(true)}
            className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-2 text-sm font-medium shadow-md hover:shadow-lg"
          >
            <Eye className="w-4 h-4" />
            Voir tous les détails
          </button>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t">
            <StatusBadge active={city.isActive} />
            <ActionButtons 
              onEdit={onEdit} 
              onDelete={onDelete} 
              isDeleting={isDeleting} 
            />
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-cyan-500 text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }} />
              </div>
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Globe className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{city.name}</h2>
                    <p className="text-sm opacity-90 mt-1 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {city.country}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto flex-1 p-6 space-y-6">
              
              {/* City Image */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                  <Map className="w-5 h-5" />
                  Image de la ville
                </h3>
                <AspectRatio ratio={21 / 9} className="bg-gray-100 rounded-lg overflow-hidden shadow-lg">
                  <img
                    src={city.image}
                    alt={city.name || 'Ville'}
                    className="w-full h-full object-cover"
                  />
                </AspectRatio>
              </div>

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Informations de base
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                      <Globe className="w-5 h-5" />
                      <span className="font-semibold">Pays</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{city.country}</p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                      <Navigation className="w-5 h-5" />
                      <span className="font-semibold">Rayon de couverture</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{city.radius} km</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-700 mb-2">
                      <span className="font-semibold">Statut</span>
                    </div>
                    <div className="flex gap-2">
                      {city.isActive ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          Actif
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm font-medium">
                          Inactif
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Multilingual Names */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Noms multilingues</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      🇫🇷 Français
                    </h4>
                    <p className="text-gray-900 text-lg font-bold">{city.name}</p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                      🇲🇦 العربية
                    </h4>
                    <p className="text-gray-900 text-lg font-bold" dir="rtl">{city.nameAr}</p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      🇬🇧 English
                    </h4>
                    <p className="text-gray-900 text-lg font-bold">{city.nameEn}</p>
                  </div>
                </div>
              </div>

              {/* Coordinates & Addresses */}
              {city.coordinates && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Coordonnées géographiques
                  </h3>

                  {/* GPS Coordinates */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-lg border-2 border-blue-200">
                    <div className="flex items-center gap-2 text-blue-700 mb-3">
                      <Navigation className="w-5 h-5" />
                      <span className="font-semibold text-lg">Coordonnées GPS</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <span className="text-xs text-gray-600 font-medium">Latitude</span>
                        <p className="text-xl font-mono font-bold text-gray-900 mt-1">
                          {city.coordinates.latitude?.toFixed(6)}°
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <span className="text-xs text-gray-600 font-medium">Longitude</span>
                        <p className="text-xl font-mono font-bold text-gray-900 mt-1">
                          {city.coordinates.longitude?.toFixed(6)}°
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Addresses */}
                  <div className="space-y-3">
                    {city.coordinates.address && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                          🇫🇷 Adresse (Français)
                        </h4>
                        <p className="text-gray-900">{city.coordinates.address}</p>
                      </div>
                    )}

                    {city.coordinates.addressAr && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                          🇲🇦 العنوان (العربية)
                        </h4>
                        <p className="text-gray-900" dir="rtl">{city.coordinates.addressAr}</p>
                      </div>
                    )}

                    {city.coordinates.addressEn && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                          🇬🇧 Address (English)
                        </h4>
                        <p className="text-gray-900">{city.coordinates.addressEn}</p>
                      </div>
                    )}
                  </div>

                  {/* Interactive Google Map */}
                  {currentLocation && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          <Map className="w-5 h-5 text-blue-600" />
                          Carte interactive
                        </h4>
                        <div className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                          Zone de couverture: {city.radius} km
                        </div>
                      </div>
                      


                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="text-center">
                            <p className="text-gray-600 text-xs mb-1">Latitude</p>
                            <p className="font-mono font-bold text-blue-700">
                              {city.coordinates.latitude?.toFixed(6)}°
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-600 text-xs mb-1">Longitude</p>
                            <p className="font-mono font-bold text-blue-700">
                              {city.coordinates.longitude?.toFixed(6)}°
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-600 text-xs mb-1">Rayon</p>
                            <p className="font-bold text-blue-700">{city.radius} km</p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-600 text-xs mb-1">Surface</p>
                            <p className="font-bold text-gray-900">
                              {(Math.PI * Math.pow(city.radius, 2)).toFixed(0)} km²
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Coverage Area Visualization with Map */}
              {currentLocation && (
                <div className="bg-gradient-to-br from-blue-50 to-pink-50 p-5 rounded-lg border-2 border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                    <Navigation className="w-5 h-5" />
                    Zone de couverture
                  </h3>
                  


                  {/* Statistiques de la zone */}
                  <div className="bg-white p-4 rounded-lg shadow-sm space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 font-medium text-sm">Centre:</span>
                        <span className="font-bold text-gray-900">{city.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 font-medium text-sm">Rayon:</span>
                        <span className="font-bold text-blue-700">{city.radius} km</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 font-medium text-sm">Surface:</span>
                        <span className="font-bold text-gray-900">
                          ~{(Math.PI * Math.pow(city.radius, 2)).toFixed(2)} km²
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 font-medium text-sm">Périmètre:</span>
                        <span className="font-bold text-gray-900">
                          ~{(2 * Math.PI * city.radius).toFixed(2)} km
                        </span>
                      </div>
                    </div>

                    {/* Coordonnées du centre */}
                    <div className="pt-3 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="bg-blue-50 p-2 rounded text-center">
                          <p className="text-gray-600 mb-1">Latitude centre</p>
                          <p className="font-mono font-bold text-blue-700">
                            {city.coordinates.latitude?.toFixed(6)}°
                          </p>
                        </div>
                        <div className="bg-blue-50 p-2 rounded text-center">
                          <p className="text-gray-600 mb-1">Longitude centre</p>
                          <p className="font-mono font-bold text-blue-700">
                            {city.coordinates.longitude?.toFixed(6)}°
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Dates
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {city.created_at && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="font-medium text-gray-600 text-sm">Créé le</label>
                      <p className="text-gray-900 font-semibold mt-1">
                        {new Date(city.created_at).toLocaleString('fr-FR', {
                          dateStyle: 'long',
                          timeStyle: 'short'
                        })}
                      </p>
                    </div>
                  )}
                  {city.updated_at && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="font-medium text-gray-600 text-sm">Modifié le</label>
                      <p className="text-gray-900 font-semibold mt-1">
                        {new Date(city.updated_at).toLocaleString('fr-FR', {
                          dateStyle: 'long',
                          timeStyle: 'short'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Technical Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Informations techniques</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">ID:</span>
                    <span className="font-mono text-gray-900 bg-white px-3 py-1 rounded">{city.id}</span>
                  </div>
                  {city.imagePublicId && (
                    <div className="flex justify-between items-start py-2 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">Image Public ID:</span>
                      <span className="font-mono text-gray-900 text-xs bg-white px-3 py-1 rounded max-w-xs break-all">
                        {city.imagePublicId}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Supprimé:</span>
                    <span className={`font-semibold ${city.isDeleted ? "text-red-600" : "text-green-600"}`}>
                      {city.isDeleted ? '✗ Oui' : '✓ Non'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  onEdit();
                }}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-colors font-medium shadow-md"
              >
                Modifier
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}