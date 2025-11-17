import meditationIcon from '@/assets/icons/meditation.png';
import museumIcon from '@/assets/icons/museum.png';
import officeIcon from '@/assets/icons/office-building.png';
import potteryIcon from '@/assets/icons/pottery.png';
import saladIcon from '@/assets/icons/salad.png';
import * as DropdownMenuPrimitive from '@rn-primitives/dropdown-menu';
import * as React from 'react';
import { ViewStyle } from 'react-native';

const INDICATOR_STYLE: ViewStyle = {
  height: 5,
  width: 5,
  backgroundColor: 'red',
  borderRadius: 50,
  position: 'absolute',
  left: -10,
  top: 6,
};

import {
  AntDesign,
  Feather,
  Ionicons,
  MaterialIcons,
} from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenWithHeader } from '@/components/screen';
import { Theme } from '@/types/theme';
import * as StatusBar from 'expo-status-bar';
import ThemeCardDetailed from '@/components/theme-card-detailed';
import { getAllThemes, getThemeById } from '@/api/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getCircuitsByTheme } from '@/api/circuits';
import { Circuit, SortCategory } from '@/types/circuit';
import CircuitCard from '@/components/circuit-card';

const categoryIcons = [
  { image: museumIcon, label: 'History' },
  { image: meditationIcon, label: 'Spiritual' },
  { image: officeIcon, label: 'Gastronomy' },
  { image: potteryIcon, label: 'Traditional' },
  { image: saladIcon, label: 'Architecture' },
  { image: saladIcon, label: 'Nature' },
];
function FilterDropdown({
  title,
  onPress,
}: {
  title: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className='px-2 py-1 border border-gray-200 gap-2 rounded-full flex-row items-center'
    >
      <Text className=''>{title}</Text>
      <MaterialIcons name='keyboard-arrow-down' size={16} color='black' />
    </TouchableOpacity>
  );
}
const { width } = Dimensions.get('window');
export default function ThemesDetailsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [inViewImageIndex, setInViewImageIndex] = useState(0);
  const [theme, setTheme] = useState<Theme | null>(null);
  const [selectedCategory, setSelectedCategory] =
    useState<SortCategory>('newest');
  const [allCircuits, setAllCircuits] = useState<Circuit[]>([]);
  const [circuits, setCircuits] = useState<Circuit[]>([]);
  const { id: themeId } = useLocalSearchParams();
  const router = useRouter();
  useEffect(() => {
    getThemeById(themeId as string)
      .then((theme) => {
        getCircuitsByTheme({
          themeId: themeId as string,
          sortBy: selectedCategory,
        }).then((circuits) => {
          setAllCircuits(circuits);
          setCircuits(circuits);
        });
        return theme;
      })
      .then(setTheme)
      .catch((error) => {
        console.error('Error fetching themes:', error);
      });
  }, [themeId]);
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setCircuits(allCircuits);
    } else {
      const filtered = allCircuits.filter((circuit) =>
        circuit['en'].name
          .toLowerCase()
          .includes(searchQuery.trim().toLowerCase())
      );
      setCircuits(filtered);
    }
  }, [searchQuery]);
  if (!theme || circuits.length === 0) {
    return <ActivityIndicator size='large' color='#005000ff' />;
  }

  return (
    <ScreenWithHeader
      leftIcon={
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name='chevron-back' size={24} color='#fff' />
        </TouchableOpacity>
      }
      headerTitle={theme['en'].name}
    >
      <View className='bg-gray-100 rounded-full px-4 py-1 flex-row items-center my-4 mx-4'>
        <Feather name='search' size={18} color='#6b7280' />
        <TextInput
          placeholder='Search for restaurant, coffee...'
          placeholderTextColor='#9ca3af'
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
          className='flex-1 ml-2 text-gray-900'
        />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className='mb-2 mx-auto'
        contentContainerClassName='gap-2 flex-row mt-4 px-4'
      >
        <FilterDropdown title='Most Popular' />
        <FilterDropdown title='< 2 km' />
        <FilterDropdown title='Medina' />
      </ScrollView>

      <View className='mb-4 px-4'>
        <FlatList
          data={circuits}
          renderItem={(item) => (
            <CircuitCard
              onPress={() => router.push('/(tabs)/explore')}
              circuit={item.item}
            />
          )}
          keyExtractor={(item) => item.id}
          numColumns={2}
          scrollEnabled={false}
          className='mt-4'
          columnWrapperStyle={{ gap: 6, marginBottom: 12 }}
        />
      </View>
    </ScreenWithHeader>
  );
}

function PageHeader({
  searchQuery,
  selectedCategory,
  onCategoryChange,
  onSearchQueryChange,
  currentUser,
}: {
  searchQuery: string;
  selectedCategory: string;
  onSearchQueryChange?: (text: string) => void;
  onCategoryChange?: (category: string) => void;
  currentUser: any;
}) {
  useEffect(() => {
    StatusBar.setStatusBarStyle('dark');
  }, []);
  const { top } = useSafeAreaInsets();
  // AsyncStorage.removeItem('onboardingCompleted');
  return (
    <ScreenWithHeader headerTitle=''>
      <View className='bg-[#eee] rounded-full px-4 py-2 flex-row items-center my-4 mx-4'>
        <Feather name='search' size={18} color='#6b7280' />
        <TextInput
          placeholder='Search for restaurant, coffee...'
          placeholderTextColor='#9ca3af'
          value={searchQuery}
          onChangeText={onSearchQueryChange}
          className='flex-1 ml-2 text-gray-900'
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className='mb-2 mx-auto'
        contentContainerClassName='gap-2 flex-row'
      >
        {categoryIcons.map((cat, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => onCategoryChange?.(cat.label)}
            activeOpacity={0.7}
            className='items-center'
          >
            <View
              className={`items-center justify-center w-16 h-16 rounded-xl border-2 border-white ${
                selectedCategory === cat.label
                  ? 'border-[#023157] bg-white'
                  : 'bg-white'
              }`}
            >
              <Image
                source={cat.image}
                tintColor={
                  selectedCategory === cat.label ? '#ff462e' : undefined
                }
              />
            </View>
            <Text className='mt-1 text-white'>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ScreenWithHeader>
  );
}

const styles = StyleSheet.create({
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
