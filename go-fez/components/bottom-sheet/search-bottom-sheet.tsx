import Image1 from '@/assets/monuments/m1.jpg';
import Image2 from '@/assets/monuments/m2.jpg';
import Image3 from '@/assets/monuments/m3.jpg';
import Image4 from '@/assets/monuments/m4.jpg';
import Image5 from '@/assets/monuments/m5.png';
import Feather from '@expo/vector-icons/Feather';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useGetAllCategoriesQuery, Category } from '@/services/api/categoryApi';
import { useGetAllPOIsQuery, POI } from '@/services/api/poiApi';
import { getCategoryName, getCategoryIcon } from '@/lib/categoryUtils';
import { getPOIName, getPOIImage } from '@/lib/poiUtils';
const { width } = Dimensions.get('window');

const FILTER_TABS = ['Restaurant', 'Museums', 'Coffee', 'Shopping'];

interface BottomSheetContentProps {
  selectedLocation: any;
}

export default function SearchBottomSheetContent({
  selectedLocation,
}: BottomSheetContentProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch categories and POIs
  const { data: categoriesData } = useGetAllCategoriesQuery();
  const { data: poisData } = useGetAllPOIsQuery({ isActive: true });
  
  const categories = categoriesData?.data?.filter((cat: Category) => cat.isActive)?.slice(0, 5) || [];
  const nearbyPOIs = poisData?.pois?.slice(0, 5) || [];
  
  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/pois?search=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push('/pois');
    }
  };
  
  const handleCategoryPress = (categoryId: string) => {
    router.push(`/pois?category=${categoryId}`);
  };
  
  const handlePOIPress = (poiId: string) => {
    router.push(`/(tabs)/explore?poiId=${poiId}`);
  };

  return (
    <BottomSheetScrollView style={styles.container} scrollEnabled={true}>
      {/* Handle Bar */}
      {/* <View style={styles.handleBar} /> */}

      <View style={styles.searchContainer}>
        <Feather name='search' size={20} color='#666' style={styles.searchIcon} />
        <TextInput
          placeholder='Search for POIs, monuments, restaurants...'
          placeholderTextColor='#999'
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType='search'
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Feather name='x' size={20} color='#666' />
          </TouchableOpacity>
        )}
      </View>

      {/* Explore by Category */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Explore by category</Text>
          <TouchableOpacity onPress={() => router.push('/pois')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category: Category) => {
            const categoryName = getCategoryName(category, 'fr');
            const categoryIcon = getCategoryIcon(category);
            return (
              <TouchableOpacity 
                key={category.id} 
                style={styles.categoryCard}
                onPress={() => handleCategoryPress(category.id)}
              >
                <View style={styles.categoryImagePlaceholder}>
                  {categoryIcon ? (
                    <Image
                      source={{ uri: categoryIcon }}
                      style={{ width: 100, height: 100, borderRadius: 10 }}
                      contentFit='cover'
                    />
                  ) : (
                    <Feather name='map-pin' size={40} color='#007036' />
                  )}
                </View>
                <Text style={styles.categoryName}>{categoryName}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Nearby POIs */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Discover POIs</Text>
          <TouchableOpacity onPress={() => router.push('/pois')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        {nearbyPOIs.map((poi: POI) => {
          const poiName = getPOIName(poi, 'fr');
          const poiImage = getPOIImage(poi);
          const category = categories.find((cat: Category) => cat.id === poi.category);
          const categoryName = category ? getCategoryName(category, 'fr') : 'POI';
          
          return (
            <TouchableOpacity 
              key={poi.id} 
              style={styles.placeCard}
              onPress={() => handlePOIPress(poi.id)}
            >
              <View style={styles.placeImagePlaceholder}>
                {poiImage ? (
                  <Image
                    source={{ uri: poiImage }}
                    style={{ width: 80, height: 80, borderRadius: 8 }}
                    contentFit='cover'
                  />
                ) : (
                  <Feather name='map-pin' size={32} color='#007036' />
                )}
              </View>
              <View style={styles.placeInfo}>
                <Text style={styles.placeName}>{poiName}</Text>
                <Text style={styles.placeLocation}>{categoryName}</Text>
                {poi.rating && poi.rating > 0 && (
                  <View style={styles.ratingContainer}>
                    <Feather name='star' size={14} color='#fbbf24' />
                    <Text style={styles.ratingText}>{poi.rating.toFixed(1)}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.bottomPadding} />
    </BottomSheetScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginVertical: 16,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeTab: {
    backgroundColor: '#333',
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
  },

  section: {
    marginVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  viewAllText: {
    fontSize: 14,
    color: '#007036',
    fontWeight: '600',
  },
  categoriesScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  categoriesContent: {
    gap: 12,
  },
  categoryCard: {
    width: 100,
    alignItems: 'center',
  },
  categoryImagePlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: '#e8e8e8',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryImageText: {
    fontSize: 40,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    color: '#333',
  },
  placeCard: {
    flexDirection: 'row',
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  placeImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#e8e8e8',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  placeImageText: {
    fontSize: 32,
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  placeLocation: {
    fontSize: 12,
    color: '#999',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  bottomPadding: {
    height: 40,
  },
});
