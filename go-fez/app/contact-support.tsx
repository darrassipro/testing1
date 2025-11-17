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
export default function ContactSupportScreen() {
  const router = useRouter();

  return (
    <ScreenWithHeader
      leftIcon={
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name='chevron-back' size={24} color='#fff' />
        </TouchableOpacity>
      }
      headerTitle='Contact Support'
    >
      <Text className='p-4 text-gray-700'>
        For any assistance, please reach out to our support team at
        support@example.com.
      </Text>
    </ScreenWithHeader>
  );
}
