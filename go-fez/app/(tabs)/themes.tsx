import meditationIcon from '@/assets/icons/meditation.png';
import museumIcon from '@/assets/icons/museum.png';
import officeIcon from '@/assets/icons/office-building.png';
import potteryIcon from '@/assets/icons/pottery.png';
import saladIcon from '@/assets/icons/salad.png';
import ArchImg from '@/assets/themes/architecture.png';
import GasImg from '@/assets/themes/gastronomy.jpg';
import HistImg from '@/assets/themes/history.jpg';
import SpirImg from '@/assets/themes/spiritual.jpg';
import TradImg from '@/assets/themes/traditional.jpg';
import {
  AntDesign,
  Feather,
  Ionicons,
  MaterialIcons,
} from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
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
import { getAllThemes } from '@/api/theme';
import { useRouter } from 'expo-router';

const categoryIcons = [
  { image: museumIcon, label: 'History' },
  { image: meditationIcon, label: 'Spiritual' },
  { image: officeIcon, label: 'Gastronomy' },
  { image: potteryIcon, label: 'Traditional' },
  { image: saladIcon, label: 'Architecture' },
  { image: saladIcon, label: 'Nature' },
];
const POI_TYPES = [
  {
    icon: (color = 'black') => (
      <Ionicons name='restaurant-outline' size={16} color={color} />
    ),
    label: 'Restaurants',
  },
  {
    icon: (color = 'black') => (
      <MaterialIcons name='museum' size={16} color={color} />
    ),
    label: 'Museums',
  },
  {
    icon: (color = 'black') => (
      <Ionicons name='cafe-outline' size={16} color={color} />
    ),
    label: 'Cafes',
  },
  {
    icon: (color = 'black') => (
      <AntDesign name='shop' size={16} color={color} />
    ),
    label: 'Shops',
  },
];
const { width } = Dimensions.get('window');
export default function ThemesScreen() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [inViewImageIndex, setInViewImageIndex] = useState(0);
  const router = useRouter();
  const [themes, setThemes] = useState<Theme[]>([]);
  useEffect(() => {
    getAllThemes()
      .then(setThemes)
      .catch((error) => {
        console.error('Error fetching themes:', error);
      });
  }, []);
  console.log('Fetched Themes:', themes);
  return (
    <ScreenWithHeader
      leftIcon={
        <TouchableOpacity>
          <Feather name='menu' size={30} color='white' />
        </TouchableOpacity>
      }
      headerTitle='All Themes'
    >
      <View className='bg-gray-100 rounded-full px-4 py-1 flex-row items-center my-4 mx-4'>
        <Feather name='search' size={18} color='#6b7280' />
        <TextInput
          placeholder='Search for restaurant, coffee...'
          placeholderTextColor='#9ca3af'
          className='flex-1 ml-2 text-gray-900'
        />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className='mb-2 mx-auto'
        contentContainerClassName='gap-2 flex-row mt-4 px-4'
      >
        {POI_TYPES.map((cat, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setSelectedCategory(cat.label)}
            activeOpacity={0.7}
            className='items-center'
          >
            <View
              className={`flex-row items-center gap-2 py-1 px-2 rounded-lg border ${
                selectedCategory === cat.label
                  ? 'border-[#023157] bg-[#023157]'
                  : 'border-gray-300 bg-white'
              }`}
            >
              {cat.icon(selectedCategory === cat.label ? 'white' : 'black')}
              <Text
                className={`text-sm font-semibold ${selectedCategory === cat.label ? 'text-white' : 'text-gray-900'}`}
              >
                {cat.label}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View className='mb-4 px-4'>
        <FlatList
          data={themes}
          renderItem={(item) => <ThemeCardDetailed theme={item.item} />}
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
