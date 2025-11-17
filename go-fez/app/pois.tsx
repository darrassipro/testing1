import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useGetAllPOIsQuery, POI } from '@/services/api/poiApi';
import { useGetAllCategoriesQuery, Category } from '@/services/api/categoryApi';
import { getPOIName, getPOIImage, getPOIDescription } from '@/lib/poiUtils';
import { getCategoryName, getCategoryIcon } from '@/lib/categoryUtils';

const { width } = Dimensions.get('window');

export default function POIsPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialCategory = params.category as string | undefined;
  const initialSearch = params.search as string | undefined;

  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  const [searchTerm, setSearchTerm] = useState(initialSearch || '');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    initialCategory || null
  );
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch all POIs
  const { data: poisData, isLoading: isLoadingPOIs } = useGetAllPOIsQuery({
    isActive: true,
  });

  // Fetch all categories
  const { data: categoriesData, isLoading: isLoadingCategories } =
    useGetAllCategoriesQuery();

  // Debounce search
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (searchQuery.length >= 2) {
      debounceTimerRef.current = setTimeout(() => {
        setSearchTerm(searchQuery);
      }, 300);
    } else {
      setSearchTerm('');
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  // Filter POIs based on search and category
  const filteredPOIs = useMemo(() => {
    if (!poisData?.pois) return [];

    let filtered = poisData.pois;

    // Filter by search term
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((poi: POI) => {
        const name = getPOIName(poi, 'fr').toLowerCase();
        const description = getPOIDescription(poi, 'fr')?.toLowerCase() || '';
        return name.includes(lowerSearch) || description.includes(lowerSearch);
      });
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((poi: POI) => poi.category === selectedCategory);
    }

    return filtered;
  }, [poisData, searchTerm, selectedCategory]);

  const categories = categoriesData?.data || [];

  const handleCategoryPress = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  const handlePOIPress = (poiId: string) => {
    router.push(`/(tabs)/explore?poiId=${poiId}`);
  };

  const renderPOICard = ({ item }: { item: any }) => {
    const name = getPOIName(item, 'fr');
    const image = getPOIImage(item);
    const description = getPOIDescription(item, 'fr');

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handlePOIPress(item.id)}
        style={styles.poiCard}
      >
        <Image
          source={{ uri: image }}
          style={styles.poiImage}
          resizeMode="cover"
        />
        <View style={styles.poiContent}>
          <Text style={styles.poiName} numberOfLines={1}>
            {name}
          </Text>
          {description && (
            <Text style={styles.poiDescription} numberOfLines={2}>
              {description}
            </Text>
          )}
          {item.rating && item.rating > 0 && (
            <View style={styles.ratingContainer}>
              <FontAwesome name="star" size={14} color="#fbbf24" />
              <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
              {item.reviewCount > 0 && (
                <Text style={styles.reviewCount}>({item.reviewCount})</Text>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategoryItem = ({ item }: { item: any }) => {
    const isSelected = selectedCategory === item.id;
    const categoryName = item.id ? getCategoryName(item, 'fr') : 'Tous';
    const categoryIcon = item.id ? getCategoryIcon(item) : null;
    
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleCategoryPress(item.id)}
        style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
      >
        {categoryIcon && (
          <Image source={{ uri: categoryIcon }} style={styles.categoryIcon} />
        )}
        <Text
          style={[
            styles.categoryText,
            isSelected && styles.categoryTextActive,
          ]}
        >
          {categoryName}
        </Text>
      </TouchableOpacity>
    );
  };

  const ListHeaderComponent = () => (
    <View>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color="#6b7280" />
          <TextInput
            placeholder="Rechercher un POI..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={20} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories Filter */}
      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>Catégories</Text>
        <FlatList
          data={[{ id: null }, ...categories]}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id || 'all'}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>
          {filteredPOIs.length} POI{filteredPOIs.length > 1 ? 's' : ''} trouvé
          {filteredPOIs.length > 1 ? 's' : ''}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Points d'Intérêt</Text>
        <View style={styles.backButton} />
      </View>

      {isLoadingPOIs || isLoadingCategories ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007036" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPOIs}
          renderItem={renderPOICard}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={ListHeaderComponent}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="search" size={64} color="#d1d5db" />
              <Text style={styles.emptyTitle}>Aucun POI trouvé</Text>
              <Text style={styles.emptyText}>
                Essayez de modifier vos critères de recherche
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1f2937',
  },
  categoriesSection: {
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  categoriesList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryChipActive: {
    backgroundColor: '#007036',
    borderColor: '#007036',
  },
  categoryIcon: {
    width: 20,
    height: 20,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
  },
  categoryTextActive: {
    color: '#fff',
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  listContent: {
    paddingBottom: 16,
  },
  columnWrapper: {
    paddingHorizontal: 16,
    gap: 12,
  },
  poiCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  poiImage: {
    width: '100%',
    height: 140,
  },
  poiContent: {
    padding: 12,
  },
  poiName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  poiDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
});
