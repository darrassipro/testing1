import meditationIcon from '@/assets/icons/meditation.png';
import museumIcon from '@/assets/icons/museum.png';
import officeIcon from '@/assets/icons/office-building.png';
import potteryIcon from '@/assets/icons/pottery.png';
import saladIcon from '@/assets/icons/salad.png';
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

import CircuitCard from '@/components/circuit-card';
import { ScreenWithHeader } from '@/components/screen';
import { useCurrentUser } from '@/context/current-user';
import { useRouter } from 'expo-router';
import * as StatusBar from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllCircuits } from '@/api/circuits';
import { Circuit } from '@/types/circuit';
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
export default function CircuitsScreen() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [inViewImageIndex, setInViewImageIndex] = useState(0);
  const [circuits, setCircuits] = useState<Circuit[]>([]);
  const router = useRouter();
  useEffect(() => {
    getAllCircuits()
      .then(setCircuits)
      .catch((error) => {
        console.error('Error fetching circuits:', error);
      });
  }, []);
  // const { user } = useCurrentUser();
  // AsyncStorage.removeItem('onboardingCompleted');
  return (
    <ScreenWithHeader
      leftIcon={
        <TouchableOpacity>
          <Feather name='menu' size={30} color='white' />
        </TouchableOpacity>
      }
      headerTitle='Circuits'
    >
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
              className={`flex-row items-center gap-2 py-1 px-2 rounded-full border-1 ${
                selectedCategory === cat.label
                  ? 'border-[#005dd6] bg-[#005dd6]'
                  : 'border-[#EEEEEE] bg-white'
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

      <View className='mb-4 px-4 mt-8'>
        <Text className='text-xl font-bold mb-6'>All circuits</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className='mb-2 mx-auto'
          contentContainerClassName='gap-2 flex-row'
        >
          {categoryIcons.map((cat, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                setSelectedCategory(cat.label);
              }}
              activeOpacity={0.7}
              className='items-center'
            >
              <View
                className={`items-center px-2 py-1 justify-center rounded-xl border border-gray-300 flex-row gap-1`}
              >
                <Text className='text-xs'>{cat.label}</Text>
                <MaterialIcons
                  name='keyboard-arrow-down'
                  size={16}
                  color='black'
                />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text className='text-gray-700 mt-2 mb-1'>History</Text>
        <FlatList
          showsHorizontalScrollIndicator={false}
          data={[...circuits].sort(() => Math.random() - 0.5)}
          horizontal
          renderItem={(item) => (
            <CircuitCard
              onPress={() => router.push(`/(tabs)/circuit-detail?id=${item.item.id}`)}
              circuit={item.item}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerClassName='gap-2'
          className='mt-4 gap-4'
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
