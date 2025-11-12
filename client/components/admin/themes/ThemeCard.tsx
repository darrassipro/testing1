'use client';

import { useState, useMemo } from 'react';
import ImagePreview from '../shared/ImagePreview';
import { StatusBadge } from '../shared/StatusBadge';
import { ActionButtons } from '../shared/ActionButtons';
import { cloudinaryLoader } from '@/utils/cloudenary-loader';
import { X, Eye, MapPin, Clock, Route, Star, Calendar, Palette, Image as ImageIcon, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface ThemeCardProps {
  theme: any;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  parseLoc: (loc: any) => { name: string; desc: string };
}

export function ThemeCard({ theme, onEdit, onDelete, isDeleting, parseLoc }: ThemeCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const circuitsPerPage = 6;
  
  const frLoc = parseLoc(theme.fr);
  const arLoc = parseLoc(theme.ar);
  const enLoc = parseLoc(theme.en);

  // Get circuits from the theme
  const circuits = theme.circuitsFromThemes || [];

  // Helper function to safely parse localization (handles both JSON string and object)
  const parseLocalization = (loc: any): { name: string; description: string } => {
    // If it's already an object with the right structure
    if (loc && typeof loc === 'object' && !Array.isArray(loc)) {
      return {
        name: loc.name || '',
        description: loc.description || loc.desc || ''
      };
    }
    
    // If it's a JSON string, parse it
    if (typeof loc === 'string') {
      try {
        const parsed = JSON.parse(loc);
        return {
          name: parsed.name || '',
          description: parsed.description || parsed.desc || ''
        };
      } catch {
        return { name: '', description: '' };
      }
    }
    
    return { name: '', description: '' };
  };

  // Helper function to get best available circuit name
  const getCircuitName = (circuit: any): string => {
    const fr = parseLocalization(circuit.fr);
    const en = parseLocalization(circuit.en);
    const ar = parseLocalization(circuit.ar);
    
    return fr.name || en.name || ar.name || 'Circuit sans nom';
  };

  // Helper function to get best available circuit description
  const getCircuitDescription = (circuit: any): string => {
    const fr = parseLocalization(circuit.fr);
    const en = parseLocalization(circuit.en);
    const ar = parseLocalization(circuit.ar);
    
    return fr.description || en.description || ar.description || '';
  };

  // Pagination calculations
  const totalPages = Math.ceil(circuits.length / circuitsPerPage);
  const startIndex = (currentPage - 1) * circuitsPerPage;
  const endIndex = startIndex + circuitsPerPage;
  const currentCircuits = circuits.slice(startIndex, endIndex);

  const handleOpenModal = () => {
    setCurrentPage(1);
    setShowModal(true);
  };

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));
  const goToPage = (page: number) => setCurrentPage(page);

  const getPageNumbers = useMemo(() => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  }, [currentPage, totalPages]);

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden">
        <div className="relative">
          <ImagePreview src={theme.image} alt={frLoc.name || 'Thème'} className="w-full h-40" />
          <div
            className="absolute top-3 left-3 w-12 h-12 rounded-lg shadow-lg flex items-center justify-center"
            style={{ backgroundColor: theme.color }}
          >
            {theme.icon && (
              <img
                src={cloudinaryLoader({ src: theme.icon, width: 48, height: 48, quality: 90 })}
                alt="icon"
                className="w-8 h-8 object-contain"
              />
            )}
          </div>
        </div>
        <div className="p-4 space-y-3">
          <h3 className="font-bold text-lg text-gray-900 mb-1">{frLoc.name || 'Sans nom'}</h3>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{frLoc.desc}</p>
          
          <button
            onClick={handleOpenModal}
            className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-blue-500 text-white rounded-lg hover:from-blue-600 hover:to-blue-600 transition-all flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Eye className="w-4 h-4" />
            Voir tous les détails
          </button>

          <div className="flex items-center justify-between pt-3 border-t">
            <StatusBadge
              active={theme.isActive}
              count={theme.circuitsCount}
              countLabel="circuits"
            />
            <ActionButtons onEdit={onEdit} onDelete={onDelete} isDeleting={isDeleting} />
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div 
              className="p-6 border-b border-gray-200 flex items-center justify-between text-white relative overflow-hidden"
              style={{ backgroundColor: theme.color }}
            >
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }} />
              </div>
              
              <div className="relative z-10 flex items-center gap-4">
                {theme.icon && (
                  <div className="w-16 h-16 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <img
                      src={cloudinaryLoader({ src: theme.icon, width: 64, height: 64, quality: 90 })}
                      alt="icon"
                      className="w-10 h-10 object-contain"
                    />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold">{frLoc.name || 'Thème'}</h2>
                  <p className="text-sm opacity-90 mt-1">
                    {circuits.length} circuit{circuits.length > 1 ? 's' : ''} associé{circuits.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="relative z-10 p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-6">
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Image du thème
                </h3>
                <AspectRatio ratio={16 / 9} className="bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={theme.image}
                    alt={frLoc.name || 'Thème'}
                    className="w-full h-full object-cover"
                  />
                </AspectRatio>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Informations du thème</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-700 mb-2">
                      <Palette className="w-5 h-5" />
                      <span className="font-semibold">Couleur du thème</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-lg shadow-md border-2 border-white"
                        style={{ backgroundColor: theme.color }}
                      />
                      <div>
                        <p className="text-gray-900 font-mono font-bold">{theme.color}</p>
                        <p className="text-xs text-gray-500">Code couleur hexadécimal</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-700 mb-2">
                      <ImageIcon className="w-5 h-5" />
                      <span className="font-semibold">Icône</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-lg shadow-md flex items-center justify-center"
                        style={{ backgroundColor: theme.color }}
                      >
                        {theme.icon && (
                          <img
                            src={cloudinaryLoader({ src: theme.icon, width: 48, height: 48, quality: 90 })}
                            alt="icon"
                            className="w-8 h-8 object-contain"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 break-all">{theme.iconPublicId || 'Non disponible'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-700 mb-2">
                      <span className="font-semibold">Statut</span>
                    </div>
                    <div className="flex gap-2">
                      {theme.isActive ? (
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

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                      <Route className="w-5 h-5" />
                      <span className="font-semibold">Circuits associés</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{circuits.length}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Localisations</h3>
                
                {(frLoc.name || frLoc.desc) && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      🇫🇷 Français
                    </h4>
                    <div className="space-y-2 text-sm">
                      {frLoc.name && (
                        <div>
                          <span className="font-medium text-gray-700">Nom:</span>
                          <p className="text-gray-900 text-base font-semibold mt-1">{frLoc.name}</p>
                        </div>
                      )}
                      {frLoc.desc && (
                        <div className="mt-3">
                          <span className="font-medium text-gray-700">Description:</span>
                          <p className="text-gray-900 mt-1">{frLoc.desc}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {(arLoc.name || arLoc.desc) && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                      🇲🇦 العربية
                    </h4>
                    <div className="space-y-2 text-sm" dir="rtl">
                      {arLoc.name && (
                        <div>
                          <span className="font-medium text-gray-700">الاسم:</span>
                          <p className="text-gray-900 text-base font-semibold mt-1">{arLoc.name}</p>
                        </div>
                      )}
                      {arLoc.desc && (
                        <div className="mt-3">
                          <span className="font-medium text-gray-700">الوصف:</span>
                          <p className="text-gray-900 mt-1">{arLoc.desc}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {(enLoc.name || enLoc.desc) && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      🇬🇧 English
                    </h4>
                    <div className="space-y-2 text-sm">
                      {enLoc.name && (
                        <div>
                          <span className="font-medium text-gray-700">Name:</span>
                          <p className="text-gray-900 text-base font-semibold mt-1">{enLoc.name}</p>
                        </div>
                      )}
                      {enLoc.desc && (
                        <div className="mt-3">
                          <span className="font-medium text-gray-700">Description:</span>
                          <p className="text-gray-900 mt-1">{enLoc.desc}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

             {      /*       {circuits.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Route className="w-5 h-5" />
                      Circuits associés ({circuits.length})
                    </h3>
                    {totalPages > 1 && (
                      <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                        Page {currentPage} sur {totalPages}
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[400px]">
                    {currentCircuits.map((circuit: any) => {
                      const circuitName = getCircuitName(circuit);
                      const circuitDesc = getCircuitDescription(circuit);
                      
                      return (
                        <div key={circuit.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1 group">
                          <div className="relative">
                            <AspectRatio ratio={16 / 9} className="bg-gradient-to-br from-blue-100 via-blue-100 to-pink-100">
                              {circuit.image ? (
                                <img
                                  src={circuit.image}
                                  alt={circuitName}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  onError={(e) => {
                                    // Fallback if image fails to load
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 via-blue-400 to-pink-400">
                                  <Route className="w-12 h-12 text-white opacity-50" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </AspectRatio>

                            <div className="absolute top-2 right-2 flex gap-1">
                              {circuit.isPremium && (
                                <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold shadow-lg">
                                  Premium
                                </span>
                              )}
                              {circuit.isActive && (
                                <span className="px-2 py-0.5 bg-green-400 text-green-900 rounded-full text-xs font-bold shadow-lg">
                                  Actif
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="p-3 space-y-2">
                            <h4 className="font-bold text-gray-900 text-sm line-clamp-1" title={circuitName}>
                              {circuitName}
                            </h4>
                            
                            {circuitDesc && (
                              <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                                {circuitDesc}
                              </p>
                            )}

                            <div className="grid grid-cols-2 gap-1.5 text-xs">
                              {circuit.duration && (
                                <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded">
                                  <Clock className="w-3 h-3 text-blue-600 flex-shrink-0" />
                                  <span className="text-blue-700 font-medium">{circuit.duration}h</span>
                                </div>
                              )}
                              
                              {circuit.distance && (
                                <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded">
                                  <Route className="w-3 h-3 text-green-600 flex-shrink-0" />
                                  <span className="text-green-700 font-medium">{circuit.distance}km</span>
                                </div>
                              )}
                              
                              {circuit.city && (
                                <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded col-span-2">
                                  <MapPin className="w-3 h-3 text-blue-600 flex-shrink-0" />
                                  <span className="text-blue-700 font-medium truncate">{circuit.city.name}</span>
                                </div>
                              )}
                              
                              {circuit.pois && circuit.pois.length > 0 && (
                                <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded">
                                  <MapPin className="w-3 h-3 text-blue-600 flex-shrink-0" />
                                  <span className="text-blue-700 font-medium">{circuit.pois.length} POIs</span>
                                </div>
                              )}

                              {(circuit.rating !== null && circuit.rating !== undefined) && (
                                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
                                  <Star className="w-3 h-3 text-yellow-600 fill-yellow-600 flex-shrink-0" />
                                  <span className="text-yellow-700 font-medium">{circuit.rating}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex flex-col items-center gap-4 pt-6">
                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 via-blue-500 to-blue-500 transition-all duration-300 ease-out rounded-full"
                          style={{ width: `${(currentPage / totalPages) * 100}%` }}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={goToFirstPage}
                          disabled={currentPage === 1}
                          className="p-2 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 hover:from-blue-100 hover:to-blue-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 group"
                          title="Première page"
                        >
                          <ChevronsLeft className="w-4 h-4 text-gray-700 group-hover:text-blue-700" />
                        </button>

                        <button
                          onClick={goToPreviousPage}
                          disabled={currentPage === 1}
                          className="p-2 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 hover:from-blue-100 hover:to-blue-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 group"
                          title="Page précédente"
                        >
                          <ChevronLeft className="w-4 h-4 text-gray-700 group-hover:text-blue-700" />
                        </button>

                        <div className="flex items-center gap-1.5">
                          {getPageNumbers.map((pageNum, index) => {
                            if (pageNum === '...') {
                              return (
                                <span key={`dots-${index}`} className="px-2 text-gray-400 font-bold">
                                  ⋯
                                </span>
                              );
                            }

                            const page = pageNum as number;
                            const isActive = page === currentPage;

                            return (
                              <button
                                key={page}
                                onClick={() => goToPage(page)}
                                className={`
                                  min-w-[40px] h-10 rounded-lg font-semibold text-sm transition-all duration-300 transform
                                  ${isActive 
                                    ? 'bg-gradient-to-br from-blue-500 via-blue-500 to-blue-500 text-white shadow-lg scale-110 ring-2 ring-blue-300 ring-offset-2' 
                                    : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 hover:from-blue-100 hover:to-blue-200 hover:text-blue-700 hover:scale-105'
                                  }
                                `}
                              >
                                {page}
                              </button>
                            );
                          })}
                        </div>

                        <button
                          onClick={goToNextPage}
                          disabled={currentPage === totalPages}
                          className="p-2 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 hover:from-blue-100 hover:to-blue-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 group"
                          title="Page suivante"
                        >
                          <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-blue-700" />
                        </button>

                        <button
                          onClick={goToLastPage}
                          disabled={currentPage === totalPages}
                          className="p-2 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 hover:from-blue-100 hover:to-blue-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 group"
                          title="Dernière page"
                        >
                          <ChevronsRight className="w-4 h-4 text-gray-700 group-hover:text-blue-700" />
                        </button>
                      </div>

                      <div className="text-xs text-gray-500 bg-gray-50 px-4 py-2 rounded-full">
                        Affichage de {startIndex + 1} à {Math.min(endIndex, circuits.length)} sur {circuits.length} circuits
                      </div>
                    </div>
                  )}
                </div>
              )}

              {circuits.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Route className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">Aucun circuit associé à ce thème</p>
                </div>
              )*/}

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Dates
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <label className="font-medium text-gray-600 text-xs">Créé le</label>
                    <p className="text-gray-900 font-semibold mt-1">
                      {new Date(theme.created_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  {theme.updated_at && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <label className="font-medium text-gray-600 text-xs">Modifié le</label>
                      <p className="text-gray-900 font-semibold mt-1">
                        {new Date(theme.updated_at).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Informations techniques</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID:</span>
                    <span className="font-mono text-gray-900">{theme.id}</span>
                  </div>
                  {theme.imagePublicId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Image Public ID:</span>
                      <span className="font-mono text-gray-900 text-xs">{theme.imagePublicId}</span>
                    </div>
                  )}
                  {theme.iconPublicId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Icon Public ID:</span>
                      <span className="font-mono text-gray-900 text-xs">{theme.iconPublicId}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Supprimé:</span>
                    <span className={theme.isDeleted ? "text-red-600" : "text-green-600"}>
                      {theme.isDeleted ? 'Oui' : 'Non'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

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
                className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-colors"
                style={{ backgroundColor: theme.color }}
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