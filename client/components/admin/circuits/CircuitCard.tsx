'use client';

import { useState } from 'react';
import ImagePreview from '../shared/ImagePreview';
import { StatusBadge } from '../shared/StatusBadge';
import { ActionButtons } from '../shared/ActionButtons';
import { MapPin, Clock, Route, Star, X, Eye, ChevronDown, ChevronUp, DollarSign, Map } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface CircuitCardProps {
  circuit: any;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  parseLoc: (loc: any) => { name: string; description: string };
}

export function CircuitCard({ circuit, onEdit, onDelete, isDeleting, parseLoc }: CircuitCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  
  const frLoc = parseLoc(circuit.fr);
  const arLoc = parseLoc(circuit.ar);
  const enLoc = parseLoc(circuit.en);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Get all POI coordinates for map display
  const poiCoordinates = circuit.pois?.map((poi: any) => ({
    id: poi.id,
    name: poi.frLocalization?.name || poi.enLocalization?.name || poi.arLocalization?.name || 'POI',
    lat: poi.coordinates?.latitude,
    lng: poi.coordinates?.longitude,
  })).filter((poi: any) => poi.lat && poi.lng) || [];

  // Calculate map center (average of all POI coordinates)
  const mapCenter = poiCoordinates.length > 0
    ? {
        lat: poiCoordinates.reduce((sum: number, poi: any) => sum + poi.lat, 0) / poiCoordinates.length,
        lng: poiCoordinates.reduce((sum: number, poi: any) => sum + poi.lng, 0) / poiCoordinates.length,
      }
    : null;

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-100">
        <ImagePreview src={circuit.image} alt={frLoc.name || 'Circuit'} className="w-full h-48" />
        <div className="p-4 space-y-3">
          <h3 className="font-bold text-lg text-gray-900">{frLoc.name || 'Sans nom'}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{frLoc.description}</p>
          
          <div className="text-sm text-gray-500 space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <strong>Ville:</strong> 
              <span>{circuit.city?.name || '—'}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <strong>Durée:</strong> 
              <span>{circuit.duration}h</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Route className="w-4 h-4 text-blue-600" />
              <strong>Distance:</strong> 
              <span>{circuit.distance} km</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <strong>Note:</strong> 
              <span>{circuit.rating ?? '—'} ({circuit.reviewCount ?? 0} avis)</span>
            </div>
            
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <strong>POIs:</strong> 
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                {circuit.pois?.length || 0}
              </span>
            </div>
            
            {circuit.price && (
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <strong>Prix:</strong> 
                <span>{circuit.price} MAD</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 pt-2">
            {circuit.themes?.map((theme: any) => {
              const themeFr = parseLoc(theme.fr);
              return (
                <span key={theme.id} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {themeFr.name || 'Thème'}
                </span>
              );
            })}
          </div>

          {/* Detail Button */}
          <button
            onClick={() => setShowModal(true)}
            className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-blue-500 text-white rounded-lg hover:from-blue-600 hover:to-blue-600 transition-all flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Eye className="w-4 h-4" />
            Voir tous les détails
          </button>
          
          <div className="flex items-center justify-between pt-3 border-t">
            <StatusBadge active={circuit.isActive} premium={circuit.isPremium} />
            <ActionButtons onEdit={onEdit} onDelete={onDelete} isDeleting={isDeleting} />
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-500 to-blue-500 text-white">
              <div>
                <h2 className="text-2xl font-bold">{frLoc.name || 'Circuit'}</h2>
                <p className="text-sm text-blue-100 mt-1">
                  {circuit.city?.name || 'Ville non spécifiée'}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto flex-1 p-6 space-y-6">
              
              {/* Circuit Image */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Image du circuit</h3>
                <AspectRatio ratio={16 / 9} className="bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={circuit.image}
                    alt={frLoc.name || 'Circuit'}
                    className="w-full h-full object-cover"
                  />
                </AspectRatio>
              </div>

              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Informations de base</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                      <Clock className="w-5 h-5" />
                      <span className="font-semibold">Durée</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{circuit.duration}h</p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-green-600 mb-2">
                      <Route className="w-5 h-5" />
                      <span className="font-semibold">Distance</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{circuit.distance} km</p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                      <MapPin className="w-5 h-5" />
                      <span className="font-semibold">Points d'intérêt</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{circuit.pois?.length || 0}</p>
                  </div>

                  {circuit.price && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-600 mb-2">
                        <DollarSign className="w-5 h-5" />
                        <span className="font-semibold">Prix</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{circuit.price} MAD</p>
                    </div>
                  )}

                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-orange-600 mb-2">
                      <Star className="w-5 h-5" />
                      <span className="font-semibold">Note</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {circuit.rating ?? '—'}
                      <span className="text-sm font-normal text-gray-600 ml-1">
                        ({circuit.reviewCount ?? 0})
                      </span>
                    </p>
                  </div>
                </div>

                {/* Start/End Points with POIs */}
                {(circuit.startPoint || circuit.endPoint || (circuit.pois && circuit.pois.length > 0)) && (
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg space-y-3 border border-gray-200">
                    {circuit.startPoint && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <span className="text-green-600 font-semibold text-sm">Point de départ</span>
                          <p className="text-gray-900 font-medium">{circuit.startPoint}</p>
                        </div>
                      </div>
                    )}

                    {/* POIs Selected - Between Start and End */}
                    {circuit.pois && circuit.pois.length > 0 && (
                      <div className="ml-4 pl-4 border-l-2 border-blue-300 space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          <span className="text-blue-600 font-semibold text-sm">
                            POIs sélectionnés ({circuit.pois.length})
                          </span>
                        </div>
                        <div className="space-y-2">
                          {circuit.pois.map((poi: any, index: number) => (
                            <div key={poi.id} className="flex items-start gap-2 bg-white p-2 rounded-lg border border-blue-100">
                              <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {index + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-gray-900 text-sm font-medium truncate">
                                  {poi.frLocalization?.name || poi.enLocalization?.name || poi.arLocalization?.name || 'POI sans nom'}
                                </p>
                                {poi.coordinates && (
                                  <p className="text-xs text-gray-500 font-mono">
                                    {poi.coordinates.latitude?.toFixed(4)}, {poi.coordinates.longitude?.toFixed(4)}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {circuit.endPoint && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <span className="text-red-600 font-semibold text-sm">Point d'arrivée</span>
                          <p className="text-gray-900 font-medium">{circuit.endPoint}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Status Badges */}
                <div className="flex gap-2">
                  {circuit.isActive && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      Actif
                    </span>
                  )}
                  {circuit.isPremium && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                      Premium
                    </span>
                  )}
                </div>
              </div>

              {/* Themes */}
              {circuit.themes && circuit.themes.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Thèmes associés</h3>
                  <div className="flex flex-wrap gap-2">
                    {circuit.themes.map((theme: any) => {
                      const themeFr = parseLoc(theme.fr);
                      return (
                        <div key={theme.id} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium">
                          {themeFr.name || 'Thème'}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Localizations */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Localisations</h3>
                
                {/* French */}
                {(frLoc.name || frLoc.description) && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      🇫🇷 Français
                    </h4>
                    <div className="space-y-2 text-sm">
                      {frLoc.name && (
                        <div>
                          <span className="font-medium text-gray-700">Nom:</span>
                          <p className="text-gray-900">{frLoc.name}</p>
                        </div>
                      )}
                      {frLoc.description && (
                        <div>
                          <span className="font-medium text-gray-700">Description:</span>
                          <p className="text-gray-900">{frLoc.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Arabic */}
                {(arLoc.name || arLoc.description) && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                      🇲🇦 العربية
                    </h4>
                    <div className="space-y-2 text-sm" dir="rtl">
                      {arLoc.name && (
                        <div>
                          <span className="font-medium text-gray-700">الاسم:</span>
                          <p className="text-gray-900">{arLoc.name}</p>
                        </div>
                      )}
                      {arLoc.description && (
                        <div>
                          <span className="font-medium text-gray-700">الوصف:</span>
                          <p className="text-gray-900">{arLoc.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* English */}
                {(enLoc.name || enLoc.description) && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      🇬🇧 English
                    </h4>
                    <div className="space-y-2 text-sm">
                      {enLoc.name && (
                        <div>
                          <span className="font-medium text-gray-700">Name:</span>
                          <p className="text-gray-900">{enLoc.name}</p>
                        </div>
                      )}
                      {enLoc.description && (
                        <div>
                          <span className="font-medium text-gray-700">Description:</span>
                          <p className="text-gray-900">{enLoc.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* POIs List with Coordinates */}
              {circuit.pois && circuit.pois.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Points d'intérêt du circuit ({circuit.pois.length})
                  </h3>
                  
                  <div className="space-y-3">
                    {circuit.pois.map((poi: any, index: number) => (
                      <div key={poi.id} className="border border-blue-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleSection(`poi-${poi.id}`)}
                          className="w-full px-4 py-3 bg-blue-50 hover:bg-blue-100 transition-colors flex items-center justify-between text-left"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                              {index + 1}
                            </span>
                            <div>
                              <span className="font-semibold text-blue-900">
                                {poi.frLocalization?.name || poi.enLocalization?.name || poi.arLocalization?.name || 'POI sans nom'}
                              </span>
                              {poi.coordinates && (
                                <p className="text-xs text-gray-600 mt-1">
                                  📍 Lat: {poi.coordinates.latitude?.toFixed(6)}, Lng: {poi.coordinates.longitude?.toFixed(6)}
                                </p>
                              )}
                            </div>
                          </div>
                          {expandedSections[`poi-${poi.id}`] ? (
                            <ChevronUp className="w-4 h-4 text-blue-600" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-blue-600" />
                          )}
                        </button>
                        
                        {expandedSections[`poi-${poi.id}`] && (
                          <div className="p-4 bg-white space-y-3">
                            {/* POI Image */}
                            {poi.poiFile?.image && (
                              <AspectRatio ratio={16 / 9} className="bg-gray-100 rounded-lg overflow-hidden">
                                <img
                                  src={poi.poiFile.image}
                                  alt={poi.frLocalization?.name || 'POI'}
                                  className="w-full h-full object-cover"
                                />
                              </AspectRatio>
                            )}

                            {/* POI Details */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              {poi.categoryPOI && (
                                <div>
                                  <span className="font-medium text-gray-600">Catégorie:</span>
                                  <p className="text-gray-900">{poi.categoryPOI.fr || '—'}</p>
                                </div>
                              )}
                              
                              {poi.frLocalization?.address && (
                                <div className="col-span-2">
                                  <span className="font-medium text-gray-600">Adresse:</span>
                                  <p className="text-gray-900">{poi.frLocalization.address}</p>
                                </div>
                              )}

                              {poi.frLocalization?.description && (
                                <div className="col-span-2">
                                  <span className="font-medium text-gray-600">Description:</span>
                                  <p className="text-gray-900 text-sm">{poi.frLocalization.description}</p>
                                </div>
                              )}

                              {/* Coordinates Display */}
                              {poi.coordinates && (
                                <div className="col-span-2 bg-gray-50 p-3 rounded-lg">
                                  <span className="font-medium text-gray-700 flex items-center gap-2 mb-2">
                                    <Map className="w-4 h-4" />
                                    Coordonnées GPS
                                  </span>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                      <span className="text-gray-600">Latitude:</span>
                                      <p className="font-mono text-gray-900">{poi.coordinates.latitude?.toFixed(6)}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">Longitude:</span>
                                      <p className="font-mono text-gray-900">{poi.coordinates.longitude?.toFixed(6)}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Map Preview Section */}
              {mapCenter && poiCoordinates.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                    <Map className="w-5 h-5" />
                    Carte du circuit
                  </h3>
                  
                  <div className="bg-gray-100 rounded-lg p-4">
                    <AspectRatio ratio={16 / 9}>
                      {/* Google Maps Static API or Leaflet/Mapbox can be integrated here */}
                      <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <Map className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600 font-medium">Carte interactive du circuit</p>
                          <p className="text-sm text-gray-500 mt-2">
                            Centre: {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {poiCoordinates.length} points d'intérêt géolocalisés
                          </p>
                          {/* You can integrate a map library here like react-leaflet or @react-google-maps/api */}
                          <div className="mt-3 text-xs text-blue-600">
                            Intégrez Google Maps, Leaflet ou Mapbox ici
                          </div>
                        </div>
                      </div>
                    </AspectRatio>

                    {/* POI Coordinates Summary */}
                    <div className="mt-4 p-3 bg-white rounded-lg">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Coordonnées des POIs:</h4>
                      <div className="space-y-1 text-xs max-h-32 overflow-y-auto">
                        {poiCoordinates.map((poi: any, idx: number) => (
                          <div key={poi.id} className="flex items-center gap-2 text-gray-600">
                            <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px]">
                              {idx + 1}
                            </span>
                            <span className="flex-1">{poi.name}</span>
                            <span className="font-mono text-[10px]">
                              {poi.lat.toFixed(4)}, {poi.lng.toFixed(4)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Dates</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="font-medium text-gray-600">Créé le</label>
                    <p className="text-gray-900">
                      {new Date(circuit.created_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  {circuit.updated_at && (
                    <div>
                      <label className="font-medium text-gray-600">Modifié le</label>
                      <p className="text-gray-900">
                        {new Date(circuit.updated_at).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  onEdit();
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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