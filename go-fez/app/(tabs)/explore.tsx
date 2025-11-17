import {
  View,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import {
  Feather,
  FontAwesome,
  FontAwesome5,
  MaterialIcons,
} from '@expo/vector-icons';
import goFezLogo from '@/assets/images/go-fez-log-no-text.png';
import museumIcon from '@/assets/icons/museum.png';
import meditationIcon from '@/assets/icons/meditation.png';
import officeIcon from '@/assets/icons/office-building.png';
import potteryIcon from '@/assets/icons/pottery.png';
import saladIcon from '@/assets/icons/salad.png';
import mapIcon from '@/assets/icons/map-icon.png';
import themeIcon from '@/assets/icons/theme icon.png';
import myLocationIcon from '@/assets/perso/my-location.png';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Image1 from '@/assets/images/explore1.jpg';
import Image2 from '@/assets/images/explore2.jpg';
import { useEffect } from 'react';
import * as StatusBar from 'expo-status-bar';
import ThemeCard from '@/components/theme-card';
import { Theme } from '@/types/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PoiBottomSheetContent from '@/components/bottom-sheet/poi-bottom-sheet';
import SearchBottomSheetContent from '@/components/bottom-sheet/search-bottom-sheet';
import CircuitMapViewer from '@/components/circuit-map-viewer';
import Monument from '@/types/monument';
import BottomSheet from '@gorhom/bottom-sheet';
import { useCallback, useMemo, useRef, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGetAllThemesQuery, Theme as ApiTheme } from '@/services/api/themeApi';
import { getThemeName } from '@/lib/themeUtils';
import {
  useGetAllCircuitsQuery,
  useGetFilteredCircuitsQuery,
  Circuit,
} from '@/services/api/circuitApi';
import { getCircuitName } from '@/lib/circuitUtils';
import { useGetAllPOIsQuery, POI } from '@/services/api/poiApi';
import { poisToMonuments, getPOICoordinates } from '@/lib/poiUtils';
import { useGetCircuitByIdQuery } from '@/services/api/circuitApi';
import PoiList from '@/components/poi-list';
import NavigationDrawer from '@/components/navigation-drawer';
import { useCurrentUser } from '@/context/current-user';
import { useGetAllCategoriesQuery, Category } from '@/services/api/categoryApi';
import { getCategoryName, getCategoryIcon } from '@/lib/categoryUtils';
import { useRouter as useExpoRouter } from 'expo-router';

const { height } = Dimensions.get('window');

const MAPTILER_API_KEY = 'cKuGgc1qdSgluaz2JWLK';
const INITIAL_REGION = {
  latitude: 34.0626,
  longitude: -5.0077,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function HomeScreen() {
  const { user } = useCurrentUser();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(
    () => [height * 0.15, height * 0.5, height * 0.6, height * 0.8],
    [height]
  );
  const [selectedMonument, setSelectedMonument] = useState<Monument | null>(
    null
  );
  const [selectedCircuitId, setSelectedCircuitId] = useState<string | null>(
    null
  );
  const [highlightedPoiId, setHighlightedPoiId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Récupérer les POIs depuis le backend
  const { data: poisData, isLoading: isLoadingPOIs } = useGetAllPOIsQuery({
    isActive: true,
  });

  // Récupérer le circuit sélectionné avec ses POIs
  const { data: circuitData } = useGetCircuitByIdQuery(
    selectedCircuitId || '',
    {
      skip: !selectedCircuitId,
    }
  );

  // Récupérer les POIs du circuit sélectionné
  const circuitPois = useMemo(() => {
    if (!circuitData?.data?.pois || !poisData?.pois) return [];

    // Les POIs du circuit contiennent déjà CircuitPOI avec l'ordre
    // Créer un map pour accéder rapidement aux POIs complets
    const poisMap = new Map(poisData.pois.map((poi: POI) => [poi.id, poi]));

    // Mapper les POIs du circuit avec leur ordre et les données complètes
    const poisWithOrder = circuitData.data.pois
      .map((circuitPoi: any) => {
        const fullPoi = poisMap.get(circuitPoi.id);
        if (!fullPoi) return null;

        // Ajouter l'ordre depuis CircuitPOI
        const order =
          (circuitPoi as any).CircuitPOI?.order ??
          (circuitPoi as any).order ??
          0;

        return {
          poi: fullPoi,
          order: order,
        };
      })
      .filter((item: any): item is { poi: POI; order: number } => item !== null)
      .sort((a: { poi: POI; order: number }, b: { poi: POI; order: number }) => a.order - b.order)
      .map((item: { poi: POI; order: number }) => item.poi);

    return poisWithOrder;
  }, [circuitData, poisData]);

  // Convertir les POIs en format Monument pour la carte
  // Si un circuit est sélectionné, afficher seulement les POIs du circuit
  const monuments = useMemo(() => {
    const poisToDisplay =
      selectedCircuitId && circuitPois.length > 0
        ? circuitPois
        : poisData?.pois || [];

    return poisToMonuments(poisToDisplay);
  }, [poisData, selectedCircuitId, circuitPois]);

  // Trouver le POI complet correspondant au Monument sélectionné
  const selectedPoi = useMemo(() => {
    if (!selectedMonument) return null;

    // Chercher d'abord dans circuitPois si on est dans un circuit
    if (selectedCircuitId && circuitPois.length > 0) {
      const poi = circuitPois.find((poi: POI) => {
        const poiIdNum = parseInt(poi.id);
        return (
          poiIdNum === selectedMonument.id ||
          poi.id === String(selectedMonument.id)
        );
      });
      if (poi) return poi;
    }

    // Sinon chercher dans tous les POIs
    if (!poisData?.pois) return null;
    const poi =
      poisData.pois.find((poi: POI) => {
        const poiIdNum = parseInt(poi.id);
        return (
          poiIdNum === selectedMonument.id ||
          poi.id === String(selectedMonument.id)
        );
      }) || null;

    return poi;
  }, [selectedMonument, poisData, circuitPois, selectedCircuitId]);

  const handleMarkerPress = useCallback((location: Monument) => {
    setSelectedMonument(location);
    setHighlightedPoiId(String(location.id));
    bottomSheetRef.current?.snapToIndex(1);
  }, []);

  const handleCircuitPress = useCallback((circuit: Circuit) => {
    setSelectedCircuitId(circuit.id);
    setSelectedMonument(null);
    setHighlightedPoiId(null);
    bottomSheetRef.current?.snapToIndex(1);
  }, []);

  const handlePoiPress = useCallback(
    (poi: POI) => {
      const coordinates = getPOICoordinates(poi);
      if (!coordinates) return;

      // Trouver le monument correspondant ou le créer depuis le POI
      let monument = monuments.find((m) => {
        const poiIdNum = parseInt(poi.id);
        return poiIdNum === m.id || poi.id === String(m.id);
      });

      // Si le monument n'existe pas, le créer depuis le POI
      if (!monument) {
        const poiMonument = poisToMonuments([poi])[0];
        if (poiMonument) {
          monument = poiMonument;
        }
      }

      if (monument) {
        setSelectedMonument(monument);
        setHighlightedPoiId(poi.id);
        bottomSheetRef.current?.snapToIndex(1);
      }
    },
    [monuments, poisData]
  );

  const handleCloseCircuit = useCallback(() => {
    setSelectedCircuitId(null);
    setSelectedMonument(null);
    setHighlightedPoiId(null);
    bottomSheetRef.current?.snapToIndex(0);
  }, []);
  useEffect(() => {
    setSelectedMonument(null);
    bottomSheetRef.current?.snapToIndex(0);
  }, [bottomSheetRef.current]);

  return (
    <SafeAreaView style={styles.container}>
      <GestureHandlerRootView style={styles.container}>
        {/* Contrôles de navigation en overlay */}
        <MapNavigationControls onMenuPress={() => setIsDrawerOpen(true)} />

        <View style={styles.mapcontainer}>
          <CircuitMapViewer
            monuments={monuments}
            currentPoiIndex={0}
            selectedPoiId={selectedMonument?.id || null}
            completedPoiIds={[]}
            showUserLocation={true}
            showCircuitRoute={selectedCircuitId !== null}
            showUserRoute={false}
            onMarkerPress={(monument) => {
              handleMarkerPress(monument);
            }}
            onPathCalculated={(distance, duration) => {
              // Route calculée
            }}
          />
        </View>
        <BottomSheet
          handleIndicatorStyle={{ backgroundColor: '#ccc' }}
          ref={bottomSheetRef}
          snapPoints={[height * 0.15, height * 0.5, height * 0.6, height * 0.8]}
          enablePanDownToClose={false}
          enableDynamicSizing={false}
          enableOverDrag={true}
          containerStyle={{
            zIndex: 50,
          }}
          index={0}
        >
          {selectedMonument ? (
            <PoiBottomSheetContent
              onClose={() => {
                setSelectedMonument(null);
                setHighlightedPoiId(null);
              }}
              selectedPoi={selectedMonument}
            />
          ) : selectedCircuitId && circuitPois.length > 0 ? (
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: '#e5e7eb',
                }}
              >
                <Text
                  style={{ fontSize: 18, fontWeight: '700', color: '#1f2937' }}
                >
                  {circuitData?.data
                    ? getCircuitName(circuitData.data, 'fr')
                    : 'Circuit'}
                </Text>
                <TouchableOpacity onPress={handleCloseCircuit}>
                  <Feather name='x' size={24} color='#1f2937' />
                </TouchableOpacity>
              </View>
              <PoiList
                pois={circuitPois}
                onPoiPress={handlePoiPress}
                highlightedId={highlightedPoiId}
              />
            </View>
          ) : (
            <PoiScreen
              bottomSheetRef={bottomSheetRef}
              onCircuitPress={handleCircuitPress}
            />
          )}
        </BottomSheet>

        {/* Navigation Drawer */}
        <NavigationDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          user={user}
        />
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  mapcontainer: {
    width: '100%',
    height: '100%',
  },
});

const slides = [
  {
    image: Image1,
    title: 'Explore Fez Freely',
    description: 'Let IZIDOR guide you in real-time to nearby treasures.',
    icon: mapIcon,
  },
  {
    image: Image2,
    title: 'Choose Your Theme',
    description:
      'Each theme offers curated routes and experiences around a central story',
    icon: themeIcon,
  },
];

const categoryIcons = [
  { image: museumIcon, label: 'All' },
  { image: meditationIcon, label: 'Explore' },
  { image: officeIcon, label: 'Favorites' },
  { image: potteryIcon, label: 'Events' },
  { image: saladIcon, label: 'Profile' },
];

const { width } = Dimensions.get('window');

// Composant pour les contrôles de navigation sur la carte
function MapNavigationControls({ onMenuPress }: { onMenuPress?: () => void }) {
  const { top } = useSafeAreaInsets();

  return (
    <View
      style={{
        position: 'absolute',
        top: top + 10,
        left: 0,
        right: 0,
        zIndex: 100,
      }}
    >
      {/* Contrôles gauche */}
      <View style={{ position: 'absolute', left: 16, top: 0 }}>
        <TouchableOpacity
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: 'white',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
          onPress={onMenuPress}
        >
          <Feather name='menu' size={20} color='#333' />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: 'white',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <MaterialIcons name='explore' size={20} color='#333' />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: 'white',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <MaterialIcons name='language' size={20} color='#333' />
        </TouchableOpacity>
      </View>

      {/* Contrôles droite */}
      <View style={{ position: 'absolute', right: 16, top: 0 }}>
        <TouchableOpacity
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: 'white',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <MaterialIcons name='fullscreen' size={20} color='#333' />
        </TouchableOpacity>
        {/* Avatar utilisateur avec points */}
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: 'white',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Image
            source={myLocationIcon}
            style={{ width: 32, height: 32, borderRadius: 16 }}
          />
          <View
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              backgroundColor: '#0065B0',
              borderRadius: 10,
              paddingHorizontal: 6,
              paddingVertical: 2,
            }}
          >
            <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
              100
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

interface PoiScreenProps {
  bottomSheetRef?: React.RefObject<any>;
  onCircuitPress?: (circuit: Circuit) => void;
}

function PoiScreen({ bottomSheetRef, onCircuitPress }: PoiScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const searchInputRef = useRef<TextInput>(null);

  const {
    data: themesData,
    isLoading: isLoadingThemes,
    error: themesError,
  } = useGetAllThemesQuery();

  // Utiliser getAllCircuits si pas de recherche, sinon getFilteredCircuits
  const shouldSearch = searchTerm.length >= 2;

  const {
    data: circuitsData,
    isLoading: isLoadingCircuits,
    error: circuitsError,
  } = useGetAllCircuitsQuery(undefined, {
    skip: shouldSearch, // Skip si on fait une recherche
  });

  const {
    data: filteredCircuitsData,
    isLoading: isLoadingFilteredCircuits,
    error: filteredCircuitsError,
  } = useGetFilteredCircuitsQuery(
    { search: searchTerm, isActive: true },
    { skip: !shouldSearch } // Skip si pas de recherche ou moins de 2 caractères
  );

  // Debounce pour la recherche
  useEffect(() => {
    // Clear le timer précédent
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Si la recherche a au moins 2 caractères, attendre 0.2 secondes
    if (searchQuery.length >= 2) {
      debounceTimerRef.current = setTimeout(() => {
        setSearchTerm(searchQuery);
      }, 200);
    } else {
      // Si moins de 2 caractères, réinitialiser la recherche
      setSearchTerm('');
    }

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  // Filtrer les thèmes actifs
  const activeThemes =
    themesData?.data?.filter((theme: ApiTheme) => theme.isActive) || [];

  // Utiliser les circuits filtrés si recherche, sinon tous les circuits actifs
  // Le backend retourne soit { data: circuits[] } soit { data: { circuits: [], ... } }
  let filteredCircuits: Circuit[] = [];
  if (filteredCircuitsData?.data) {
    if (Array.isArray(filteredCircuitsData.data)) {
      // Structure sans pagination
      filteredCircuits = filteredCircuitsData.data;
    } else if ((filteredCircuitsData.data as any)?.circuits) {
      // Structure avec pagination
      filteredCircuits = (filteredCircuitsData.data as any).circuits;
    }
  }

  const activeCircuits = shouldSearch
    ? filteredCircuits
    : circuitsData?.data?.filter((circuit: Circuit) => circuit.isActive) || [];

  const isLoadingCircuitsData = shouldSearch
    ? isLoadingFilteredCircuits
    : isLoadingCircuits;
  const handleSearchFocus = () => {
    // Faire défiler vers le haut pour laisser de l'espace au clavier
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });

    // Faire remonter le BottomSheet pour laisser de l'espace au clavier
    // Index 2 = 60% de la hauteur, Index 3 = 80% de la hauteur
    // On utilise l'index 2 (60%) pour laisser assez d'espace au clavier
    if (bottomSheetRef?.current) {
      setTimeout(() => {
        bottomSheetRef.current?.snapToIndex(2);
      }, 100);
    }
  };

  return (
    <View className='flex-1 bg-white'>
      <ScrollView
        ref={scrollViewRef}
        className='flex-1'
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {/* Barre de recherche */}
        <View className='px-4 pt-4'>
          <View className='bg-[#eee] rounded-full px-4 py-3 flex-row items-center'>
            <Feather name='search' size={18} color='#6b7280' />
            <TextInput
              ref={searchInputRef}
              placeholder='Search for restaurant, coffee...'
              placeholderTextColor='#9ca3af'
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={handleSearchFocus}
              className='flex-1 ml-2 text-gray-900'
            />
          </View>
        </View>

        {/* Section Catégories POI */}
        <CategoriesSection searchQuery={searchQuery} />

        {/* Section Explorer nos Thèmes */}
        {activeThemes.length > 0 && (
          <View className='px-4 mt-6'>
            <View className='flex-row justify-between items-center mb-3'>
              <Text className='text-lg font-bold text-gray-800'>
                Explorer nos Thèmes
              </Text>
              <TouchableOpacity
                onPress={() => {
                  // TODO: Navigate to themes page
                }}
              >
                <Text className='text-sm text-[#007036] font-semibold'>
                  Voir tout
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className='h-40'
              contentContainerStyle={{ paddingRight: 16 }}
            >
              {activeThemes.map((theme: ApiTheme) => {
                const themeName = getThemeName(theme, 'fr');
                return (
                  <TouchableOpacity
                    key={theme.id}
                    activeOpacity={0.7}
                    className='w-[100px] mr-3'
                  >
                    <Image
                      source={{ uri: theme.image }}
                      className='w-[100px] h-[100px] rounded-xl mb-2'
                      resizeMode='cover'
                    />
                    <Text
                      className='text-sm font-medium text-gray-800 text-center'
                      numberOfLines={1}
                    >
                      {themeName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              <View className='justify-center pl-2'>
                <Feather name='chevron-right' size={24} color='#9ca3af' />
              </View>
            </ScrollView>
          </View>
        )}

        {/* Affichage du loading */}
        {isLoadingThemes && activeThemes.length === 0 && (
          <View className='px-4 mt-6'>
            <Text className='text-lg font-bold text-gray-800 mb-3'>
              Explorer nos Thèmes
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className='h-40'
              contentContainerStyle={{ paddingRight: 16 }}
            >
              {Array.from({ length: 4 }).map((_, index) => (
                <View key={index} className='w-[100px] mr-3'>
                  <View className='w-[100px] h-[100px] rounded-xl mb-2 bg-gray-200' />
                  <View className='w-20 h-3.5 bg-gray-200 rounded mx-auto' />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Section Circuits */}
        {activeCircuits.length > 0 && (
          <View className='px-4 mt-6 mb-4'>
            <Text className='text-lg font-bold text-gray-800 mb-3'>
              Circuits
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className='h-[200px]'
              contentContainerStyle={{ paddingRight: 16 }}
            >
              {activeCircuits.map((circuit: Circuit) => {
                const circuitName = getCircuitName(circuit, 'fr');
                return (
                  <TouchableOpacity
                    key={circuit.id}
                    activeOpacity={0.7}
                    className='w-[200px] mr-3 bg-white rounded-xl overflow-hidden shadow-sm'
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                    onPress={() => onCircuitPress?.(circuit)}
                  >
                    <Image
                      source={{ uri: circuit.image }}
                      className='w-full h-[120px]'
                      resizeMode='cover'
                    />
                    <View className='p-3'>
                      <View className='flex-row items-center justify-between mb-1'>
                        {typeof circuit.rating === 'number' &&
                          circuit.rating > 0 && (
                            <View className='flex-row items-center'>
                              <FontAwesome
                                name='star'
                                size={14}
                                color='#fbbf24'
                              />
                              <Text className='text-sm font-semibold text-gray-800 ml-1'>
                                {circuit.rating.toFixed(1)}
                              </Text>
                            </View>
                          )}
                        {circuit.pois && circuit.pois.length > 0 && (
                          <View className='flex-row items-center'>
                            <Feather name='map-pin' size={12} color='#6b7280' />
                            <Text className='text-xs text-gray-600 ml-1'>
                              {`${circuit.pois.length} POI${circuit.pois.length > 1 ? 's' : ''}`}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text
                        className='text-base font-bold text-gray-900 mb-1'
                        numberOfLines={1}
                      >
                        {circuitName}
                      </Text>
                      {circuit.city && (
                        <Text
                          className='text-sm text-gray-600'
                          numberOfLines={1}
                        >
                          {circuit.city.name}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
              <View className='justify-center pl-2'>
                <Feather name='chevron-right' size={24} color='#9ca3af' />
              </View>
            </ScrollView>
          </View>
        )}

        {/* Affichage du loading pour les circuits */}
        {isLoadingCircuitsData && activeCircuits.length === 0 && (
          <View className='px-4 mt-6 mb-4'>
            <Text className='text-lg font-bold text-gray-800 mb-3'>
              Circuits
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className='h-[200px]'
              contentContainerStyle={{ paddingRight: 16 }}
            >
              {Array.from({ length: 3 }).map((_, index) => (
                <View
                  key={index}
                  className='w-[200px] mr-3 bg-white rounded-xl overflow-hidden'
                >
                  <View className='w-full h-[120px] bg-gray-200' />
                  <View className='p-3'>
                    <View className='w-20 h-4 bg-gray-200 rounded mb-2' />
                    <View className='w-32 h-3 bg-gray-200 rounded' />
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// Composant pour les catégories POI
function CategoriesSection({ searchQuery }: { searchQuery?: string }) {
  console.log('🔍 CategoriesSection rendered with searchQuery:', searchQuery);
  const router = useExpoRouter();
  const { data: categoriesData, isLoading } = useGetAllCategoriesQuery();

  const categories = categoriesData?.data?.filter((cat: Category) => cat.isActive) || [];
  console.log('🔍 Categories loaded:', categories.length);

  if (isLoading || categories.length === 0) return null;

  const handleCategoryPress = (categoryId: string | null) => {
    console.log('🔍 Category clicked:', categoryId);
    console.log('🔍 Current searchQuery:', searchQuery);
    const params: string[] = [];
    if (categoryId) params.push(`category=${encodeURIComponent(categoryId)}`);
    if (searchQuery && searchQuery.length > 0) params.push(`search=${encodeURIComponent(searchQuery)}`);
    const query = params.length ? `?${params.join('&')}` : '';
    const fullPath = `/pois${query}`;
    console.log('🔍 Navigating to:', fullPath);
    router.push(fullPath as any);
    console.log('🔍 Navigation called');
  };

  const handleViewAll = () => {
    console.log('🔍 View All clicked');
    console.log('🔍 Current searchQuery:', searchQuery);
    const query = searchQuery && searchQuery.length > 0 ? `?search=${encodeURIComponent(searchQuery)}` : '';
    const fullPath = `/pois${query}`;
    console.log('🔍 Navigating to:', fullPath);
    router.push(fullPath as any);
    console.log('🔍 Navigation called');
  };

  return (
    <View className='px-4 mt-6'>
      <View className='flex-row justify-between items-center mb-3'>
        <Text className='text-lg font-bold text-gray-800'>
          Catégories de POI
        </Text>
        <TouchableOpacity onPress={handleViewAll}>
          <Text className='text-sm text-[#007036] font-semibold'>
            Voir tout
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 16 }}
      >
        {/* Include an 'All' chip first */}
        <TouchableOpacity
          key={'all'}
          activeOpacity={0.7}
          onPress={() => handleCategoryPress(null)}
          style={{
            alignItems: 'center',
            marginRight: 16,
            width: 80,
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: '#f3f4f6',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 8,
              borderWidth: 2,
              borderColor: '#e5e7eb',
            }}
          >
            <FontAwesome name='th-large' size={24} color='#007036' />
          </View>
          <Text
            style={{
              fontSize: 12,
              fontWeight: '500',
              color: '#1f2937',
              textAlign: 'center',
            }}
            numberOfLines={2}
          >
            Tous
          </Text>
        </TouchableOpacity>

        {categories.slice(0, 8).map((category: Category) => {
          const categoryName = getCategoryName(category, 'fr');
          const categoryIcon = getCategoryIcon(category);
          
          return (
            <TouchableOpacity
              key={category.id}
              activeOpacity={0.7}
              onPress={() => handleCategoryPress(category.id)}
              style={{
                alignItems: 'center',
                marginRight: 16,
                width: 80,
              }}
            >
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: '#f3f4f6',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 8,
                  borderWidth: 2,
                  borderColor: '#e5e7eb',
                }}
              >
                {categoryIcon ? (
                  <Image
                    source={{ uri: categoryIcon }}
                    style={{ width: 32, height: 32 }}
                    resizeMode='contain'
                  />
                ) : (
                  <FontAwesome5 name='map-marker-alt' size={24} color='#007036' />
                )}
              </View>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '500',
                  color: '#1f2937',
                  textAlign: 'center',
                }}
                numberOfLines={2}
              >
                {categoryName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles2 = StyleSheet.create({
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  dot: {
    width: 50,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ddd',
  },
  activeDot: {
    backgroundColor: '#535353',
    width: 200,
  },
  galleryImage: {
    width: '100%',
    height: 200,
    borderRadius: 32,
    objectFit: 'cover',
  },
});
