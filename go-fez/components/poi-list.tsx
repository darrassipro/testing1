import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { POI } from '@/services/api/poiApi';
import {
  getPOIName,
  getPOIImage,
  getPOIDescription,
  getPOIAddress,
} from '@/lib/poiUtils';

interface PoiListProps {
  pois: POI[];
  onPoiPress: (poi: POI) => void;
  highlightedId?: string | null;
}

export default function PoiList({
  pois,
  onPoiPress,
  highlightedId,
}: PoiListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const rowRefs = useRef<Record<string, View | null>>({});

  useEffect(() => {
    if (!highlightedId) return;
    const el = rowRefs.current[highlightedId];
    if (el && scrollViewRef.current) {
      // Scroll to highlighted POI
      el.measureLayout(
        scrollViewRef.current as any,
        (x, y) => {
          scrollViewRef.current?.scrollTo({ y, animated: true });
        },
        () => {}
      );
    }
  }, [highlightedId]);

  const filteredPois = useMemo(() => {
    if (!searchQuery.trim()) return pois;
    const query = searchQuery.toLowerCase();
    return pois.filter((poi) => {
      const name = getPOIName(poi, 'fr');
      const description = getPOIDescription(poi, 'fr');
      const address = getPOIAddress(poi, 'fr');
      const category = poi.categoryPOI?.fr
        ? typeof poi.categoryPOI.fr === 'string'
          ? (() => {
              try {
                return JSON.parse(poi.categoryPOI.fr).name;
              } catch {
                return poi.categoryPOI.fr;
              }
            })()
          : poi.categoryPOI.fr.name
        : '';

      // Rechercher dans le nom
      if (name.toLowerCase().includes(query)) return true;

      // Rechercher dans la description
      if (description.toLowerCase().includes(query)) return true;

      // Rechercher dans l'adresse
      if (address.toLowerCase().includes(query)) return true;

      // Rechercher dans la catégorie
      if (category.toLowerCase().includes(query)) return true;

      // Rechercher dans les services
      const services = poi.practicalInfo?.services || [];
      if (services.some((s: string) => s.toLowerCase().includes(query)))
        return true;

      // Rechercher dans les équipements
      const equipements = poi.practicalInfo?.equipements || [];
      if (equipements.some((e: string) => e.toLowerCase().includes(query)))
        return true;

      return false;
    });
  }, [pois, searchQuery]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Points d'intérêt</Text>
        <View style={styles.searchContainer}>
          <Feather
            name='search'
            size={16}
            color='#6b7280'
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder='Rechercher un POI...'
            placeholderTextColor='#9ca3af'
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
      <ScrollView
        ref={scrollViewRef}
        style={styles.list}
        showsVerticalScrollIndicator={true}
      >
        {filteredPois.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? 'Aucun résultat trouvé.' : 'Aucun POI disponible.'}
            </Text>
          </View>
        ) : (
          filteredPois.map((poi, index) => {
            const isHighlighted = highlightedId === poi.id;
            const poiName = getPOIName(poi, 'fr');
            const poiImage = getPOIImage(poi);
            const coordinates = poi.coordinates;
            let lat = 0;
            let lng = 0;

            if (coordinates) {
              if ('type' in coordinates && coordinates.type === 'Point') {
                [lng, lat] = coordinates.coordinates;
              } else if (
                'latitude' in coordinates &&
                'longitude' in coordinates
              ) {
                lat = coordinates.latitude;
                lng = coordinates.longitude;
              }
            }

            return (
              <TouchableOpacity
                key={poi.id}
                ref={(el) => {
                  rowRefs.current[poi.id] = el;
                }}
                onPress={() => onPoiPress(poi)}
                style={[styles.poiRow, isHighlighted && styles.highlightedRow]}
              >
                <Image
                  source={
                    poiImage
                      ? { uri: poiImage }
                      : { uri: 'https://via.placeholder.com/48' }
                  }
                  style={styles.poiImage}
                />
                <View style={styles.poiInfo}>
                  <Text style={styles.poiName} numberOfLines={1}>
                    {poiName}
                  </Text>
                  <Text style={styles.poiCoordinates}>
                    {lat.toFixed(4)}, {lng.toFixed(4)}
                  </Text>
                </View>
                <View style={styles.orderBadge}>
                  <Text style={styles.orderText}>
                    {(poi as any).CircuitPOI?.order ?? index + 1}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
    zIndex: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  searchContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    height: 36,
    paddingLeft: 36,
    paddingRight: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    fontSize: 14,
    color: '#1f2937',
  },
  list: {
    flex: 1,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
  },
  poiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  highlightedRow: {
    backgroundColor: '#eff6ff',
  },
  poiImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 12,
  },
  poiInfo: {
    flex: 1,
    minWidth: 0,
  },
  poiName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  poiCoordinates: {
    fontSize: 12,
    color: '#6b7280',
  },
  orderBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  orderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
});
