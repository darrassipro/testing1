import { useState } from 'react';
import {
  View,
  ScrollView,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Dimensions,
  StyleSheet,
} from 'react-native';
import zelijBg from '@/assets/images/zelij.png';
import { navigate } from 'expo-router/build/global-state/routing';
import {
  Feather,
  AntDesign,
  Octicons,
  FontAwesome5,
  FontAwesome6,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import goFezLogo from '@/assets/images/go-fez-log-no-text.png';
import museumIcon from '@/assets/icons/museum.png';
import meditationIcon from '@/assets/icons/meditation.png';
import officeIcon from '@/assets/icons/office-building.png';
import potteryIcon from '@/assets/icons/pottery.png';
import saladIcon from '@/assets/icons/salad.png';
import mapIcon from '@/assets/icons/map-icon.png';
import themeIcon from '@/assets/icons/theme icon.png';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Image1 from '@/assets/images/explore1.jpg';
import Image2 from '@/assets/images/explore2.jpg';
import { useEffect } from 'react';
import * as StatusBar from 'expo-status-bar';
import ThemeCard from '@/components/theme-card';
import { Theme } from '@/types/theme';
const themes: Theme[] = [
  {
    id: 'ea1cb843-27c3-456a-8fc4-e2979f987c6c',
    ar: '{"name":"الاحتفال","desc":"احتفالات فاس"}',
    fr: '{"name":"Fête","desc":"Célébrations de Fès"}',
    en: '{"name":"Celebration","desc":"Fes Festivities"}',
    icon: 'https://res.cloudinary.com/ddiqmvgxy/image/upload/v1762021004/go-fez/themes/fsbaskooxy6q57mflm4u.png',
    image:
      'https://res.cloudinary.com/dnf11wb1l/image/upload/v1762188570/pf1ddhj7mwbzy3dzr1lw.jpg',
    imagePublicId: 'go-fez/themes/hxiwfqlbsoypfwj5xxop',
    iconPublicId: 'go-fez/themes/fsbaskooxy6q57mflm4u',
    color: '#4fe64c',
    isActive: true,
    isDeleted: false,
    createdAt: '2025-11-01T18:16:46.000Z',
    updatedAt: '2025-11-01T18:16:46.000Z',
    created_at: '2025-11-01T18:16:46.000Z',
    updated_at: '2025-11-01T18:16:46.000Z',
    circuitsFromThemes: [{ id: '9583f8c9-b84e-4323-bddb-303f78b7bc47' }],
    circuitsCount: 2,
  },
  {
    id: 'eb2dc954-38d4-567b-9fd5-f3a80g098d7d',
    ar: '{"name":"العمارة","desc":"معالم معمارية فاسية"}',
    fr: '{"name":"Architecture","desc":"Monuments architecturaux de Fès"}',
    en: '{"name":"Architecture","desc":"Historic Monuments"}',
    icon: 'https://res.cloudinary.com/ddiqmvgxy/image/upload/v1762021004/go-fez/themes/fsbaskooxy6q57mflm4u.png',
    image:
      'https://res.cloudinary.com/dnf11wb1l/image/upload/v1762188570/pf1ddhj7mwbzy3dzr1lw.jpg',
    imagePublicId: 'go-fez/themes/hxiwfqlbsoypfwj5xxop',
    iconPublicId: 'go-fez/themes/fsbaskooxy6q57mflm4u',
    color: '#ff6b4c',
    isActive: true,
    isDeleted: false,
    createdAt: '2025-11-01T18:16:46.000Z',
    updatedAt: '2025-11-01T18:16:46.000Z',
    created_at: '2025-11-01T18:16:46.000Z',
    updated_at: '2025-11-01T18:16:46.000Z',
    circuitsFromThemes: [
      { id: 'a694g9da-c95f-5434-ceec-414g89c8cd58' },
      { id: 'b805h0eb-d06g-6545-dffd-525h90d9de69' },
    ],
    circuitsCount: 3,
  },
  {
    id: 'fc3ed065-49e5-678c-0ge6-g4b91h109e8e',
    ar: '{"name":"الطعام","desc":"تجارب الطهي التقليدية"}',
    fr: '{"name":"Gastronomie","desc":"Expériences culinaires traditionnelles"}',
    en: '{"name":"Gastronomy","desc":"Traditional Culinary Experiences"}',
    icon: 'https://res.cloudinary.com/ddiqmvgxy/image/upload/v1762021004/go-fez/themes/fsbaskooxy6q57mflm4u.png',
    image:
      'https://res.cloudinary.com/dnf11wb1l/image/upload/v1762188570/pf1ddhj7mwbzy3dzr1lw.jpg',
    imagePublicId: 'go-fez/themes/hxiwfqlbsoypfwj5xxop',
    iconPublicId: 'go-fez/themes/fsbaskooxy6q57mflm4u',
    color: '#f4b860',
    isActive: true,
    isDeleted: false,
    createdAt: '2025-11-01T18:16:46.000Z',
    updatedAt: '2025-11-01T18:16:46.000Z',
    created_at: '2025-11-01T18:16:46.000Z',
    updated_at: '2025-11-01T18:16:46.000Z',
    circuitsFromThemes: [{ id: 'c906i1fc-e17h-7656-egge-636i01e0ef70' }],
    circuitsCount: 1,
  },
  {
    id: 'gd4fe176-50f6-789d-1hf7-h5ca2i210f9f',
    ar: '{"name":"الحرف","desc":"الصناعات اليدوية والفنون"}',
    fr: '{"name":"Artisanat","desc":"Arts et métiers traditionnels"}',
    en: '{"name":"Craftsmanship","desc":"Traditional Arts & Crafts"}',
    icon: 'https://res.cloudinary.com/ddiqmvgxy/image/upload/v1762021004/go-fez/themes/fsbaskooxy6q57mflm4u.png',
    image:
      'https://res.cloudinary.com/dnf11wb1l/image/upload/v1762188570/pf1ddhj7mwbzy3dzr1lw.jpg',
    imagePublicId: 'go-fez/themes/hxiwfqlbsoypfwj5xxop',
    iconPublicId: 'go-fez/themes/fsbaskooxy6q57mflm4u',
    color: '#8b5a8f',
    isActive: true,
    isDeleted: false,
    createdAt: '2025-11-01T18:16:46.000Z',
    updatedAt: '2025-11-01T18:16:46.000Z',
    created_at: '2025-11-01T18:16:46.000Z',
    updated_at: '2025-11-01T18:16:46.000Z',
    circuitsFromThemes: [
      { id: 'da07j2gd-f28i-8767-fhhf-747j12f1fg81' },
      { id: 'eb18k3he-g39j-9878-gii6-858k23g2gh92' },
    ],
    circuitsCount: 4,
  },
  {
    id: 'he5gf287-61g7-80ae-2ig8-i6db3j321g0g',
    ar: '{"name":"الطبيعة","desc":"الحدائق والمناطق الخضراء"}',
    fr: '{"name":"Nature","desc":"Jardins et espaces verts"}',
    en: '{"name":"Nature","desc":"Gardens & Green Spaces"}',
    icon: 'https://res.cloudinary.com/ddiqmvgxy/image/upload/v1762021004/go-fez/themes/fsbaskooxy6q57mflm4u.png',
    image:
      'https://res.cloudinary.com/dnf11wb1l/image/upload/v1762188570/pf1ddhj7mwbzy3dzr1lw.jpg',
    imagePublicId: 'go-fez/themes/hxiwfqlbsoypfwj5xxop',
    iconPublicId: 'go-fez/themes/fsbaskooxy6q57mflm4u',
    color: '#2ecc71',
    isActive: true,
    isDeleted: false,
    createdAt: '2025-11-01T18:16:46.000Z',
    updatedAt: '2025-11-01T18:16:46.000Z',
    created_at: '2025-11-01T18:16:46.000Z',
    updated_at: '2025-11-01T18:16:46.000Z',
    circuitsFromThemes: [{ id: 'fb19l4if-g40k-a989-hjji-959l34h2ih03' }],
    circuitsCount: 2,
  },
  {
    id: 'if6hg398-72h8-91bf-3jh9-j7ec4k432h1h',
    ar: '{"name":"التاريخ","desc":"الأثار والمواقع التاريخية"}',
    fr: '{"name":"Histoire","desc":"Sites et vestiges historiques"}',
    en: '{"name":"History","desc":"Historical Sites & Ruins"}',
    icon: 'https://res.cloudinary.com/ddiqmvgxy/image/upload/v1762021004/go-fez/themes/fsbaskooxy6q57mflm4u.png',
    image:
      'https://res.cloudinary.com/dnf11wb1l/image/upload/v1762188570/pf1ddhj7mwbzy3dzr1lw.jpg',
    imagePublicId: 'go-fez/themes/hxiwfqlbsoypfwj5xxop',
    iconPublicId: 'go-fez/themes/fsbaskooxy6q57mflm4u',
    color: '#e74c3c',
    isActive: true,
    isDeleted: false,
    createdAt: '2025-11-01T18:16:46.000Z',
    updatedAt: '2025-11-01T18:16:46.000Z',
    created_at: '2025-11-01T18:16:46.000Z',
    updated_at: '2025-11-01T18:16:46.000Z',
    circuitsFromThemes: [
      { id: 'gc20m5jg-h51l-ba90-ikk0-a60m45i3ji04' },
      { id: 'hd31n6kh-i62m-cb01-jll1-b71n56j4kj15' },
      { id: 'ie42o7li-j73n-dc12-kmm2-c82o67k5lk26' },
    ],
    circuitsCount: 5,
  },
  {
    id: 'jg7ih409-83i9-a2cg-4ki0-k8fd5l543i2i',
    ar: '{"name":"الروحانية","desc":"المساجد والأماكن المقدسة"}',
    fr: '{"name":"Spiritualité","desc":"Mosquées et lieux sacrés"}',
    en: '{"name":"Spirituality","desc":"Mosques & Sacred Places"}',
    icon: 'https://res.cloudinary.com/ddiqmvgxy/image/upload/v1762021004/go-fez/themes/fsbaskooxy6q57mflm4u.png',
    image:
      'https://res.cloudinary.com/dnf11wb1l/image/upload/v1762188570/pf1ddhj7mwbzy3dzr1lw.jpg',
    imagePublicId: 'go-fez/themes/hxiwfqlbsoypfwj5xxop',
    iconPublicId: 'go-fez/themes/fsbaskooxy6q57mflm4u',
    color: '#3498db',
    isActive: true,
    isDeleted: false,
    createdAt: '2025-11-01T18:16:46.000Z',
    updatedAt: '2025-11-01T18:16:46.000Z',
    created_at: '2025-11-01T18:16:46.000Z',
    updated_at: '2025-11-01T18:16:46.000Z',
    circuitsFromThemes: [{ id: 'jd32o7li-j73n-dc12-kmm2-c82o67k5lk26' }],
    circuitsCount: 1,
  },
];

const slides = [
  {
    image: Image1,
    title: 'Explore Fez Freely',
    description: 'Let GO FEZ guide you in real-time to nearby treasures.',
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
export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [inViewImageIndex, setInViewImageIndex] = useState(0);

  return (
    <View className='flex-1 bg-white'>
      <ScrollView className='flex-1 ' showsVerticalScrollIndicator={false}>
        <PageHeader
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onSearchQueryChange={setSearchQuery}
        />
        <View className='w-full mb-6 h-64 px-4'>
          <ScrollView
            horizontal
            pagingEnabled
            scrollEventThrottle={16}
            showsHorizontalScrollIndicator={false}
            decelerationRate='fast'
            snapToInterval={width}
            contentContainerStyle={{
              alignItems: 'center',
              gap: 16,
            }}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / (width - 32)
              );
              setInViewImageIndex(index);
            }}
          >
            {slides.map((item, i) => (
              <View
                className='flex-1 relative'
                style={{
                  width: width - 32,
                }}
                key={i}
              >
                <Image source={item.image} style={styles.galleryImage} />
                <LinearGradient
                  colors={['#00000000', '#000000cc', '#000000dd']}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={{ borderRadius: 32 }}
                  className='absolute inset-0'
                >
                  <View className='flex-row justify-between items-start p-4'>
                    <View></View>

                    <TouchableOpacity className='bg-[#007036] rounded-full px-4 py-2 flex-row items-center gap-2'>
                      <Feather name='arrow-up-right' size={18} color='white' />
                      <Text className='text-white text-sm font-semibold mr-1'>
                        Explore Fez
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View className='absolute bottom-0 left-0 right-0 p-4'>
                    <View className='bg-white h-[40px] rounded-xl p-2 aspect-square mb-3'>
                      <Image
                        source={item.icon}
                        style={{ width: 24, height: 24 }}
                      />
                    </View>
                    <Text className='text-white text-2xl font-bold mb-1'>
                      {item.title}
                    </Text>
                    <Text className='text-white/90 max-w-[80%]'>
                      {item.description}
                    </Text>
                  </View>
                </LinearGradient>
              </View>
            ))}
          </ScrollView>
          <View style={styles.dotsContainer}>
            {slides.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, inViewImageIndex === i && styles.activeDot]}
              />
            ))}
          </View>
        </View>

        <View className='mb-4 px-4'>
          <Text className='text-2xl font-bold mb-3'>Popular Themes</Text>
          <FlatList
            data={themes}
            renderItem={(item) => <ThemeCard theme={item.item} />}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={{ gap: 6, marginBottom: 12 }}
          />
        </View>
      </ScrollView>
      {/* <PageFooter /> */}
    </View>
  );
}

function PageHeader({
  searchQuery,
  selectedCategory,
  onCategoryChange,
  onSearchQueryChange,
}: {
  searchQuery: string;
  selectedCategory: string;
  onSearchQueryChange?: (text: string) => void;
  onCategoryChange?: (category: string) => void;
}) {
  useEffect(() => {
    StatusBar.setStatusBarStyle('light');
  }, []);
  const { top } = useSafeAreaInsets();
  return (
    <View className='p-6 bg-[#024072] overflow-hidden relative'>
      <Image
        source={zelijBg}
        style={{
          width: '100%',
          height: '100%',
          top: 0,
          position: 'absolute',
          //   opacity: 0.3,
          transform: [{ scale: 2 }],
        }}
      />
      <LinearGradient
        colors={['#023157', '#023157', '#023157', '#023157dd', '#023157cc']}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={{
          transform: [{ scale: 2 }],
        }}
        className='h-full w-full absolute inset-0'
      />
      <View
        className='flex-row items-center justify-between mb-4'
        style={{ marginTop: top }}
      >
        <TouchableOpacity>
          <Feather name='menu' size={30} color='white' />
        </TouchableOpacity>
        <Image
          source={goFezLogo}
          className='w-12 h-12'
          tintColor='white'
          width={200}
          height={200}
        />
        <UserAvatar />
      </View>

      {/* Search Bar */}
      <View className='bg-[#eee] rounded-full px-4 py-2 flex-row items-center my-4'>
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
                  ? 'border-green-700 bg-white'
                  : 'bg-white'
              }`}
            >
              <Image
                source={cat.image}
                tintColor={selectedCategory === cat.label ? 'green' : undefined}
              />
            </View>
            <Text className='mt-1 text-white'>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

function PageFooter() {
  const { bottom } = useSafeAreaInsets();
  return (
    <View
      className='bg-white border-t border-gray-100 flex-row items-center justify-around px-4 py-3'
      style={{ marginBottom: bottom }}
    >
      {[
        {
          icon: <Octicons name='home-fill' size={24} color='black' />,
          iconActive: <Octicons name='home-fill' size={24} color='#007036' />,
          label: 'Home',
        },
        {
          icon: <FontAwesome5 name='mountain' size={24} color='black' />,
          iconActive: (
            <FontAwesome5 name='mountain' size={24} color='#007036' />
          ),
          label: 'Themes',
        },
        {
          icon: <FontAwesome6 name='map-pin' size={24} color='black' />,
          iconActive: <FontAwesome6 name='map-pin' size={24} color='#007036' />,
          label: 'Circuits',
        },
        {
          icon: (
            <MaterialCommunityIcons
              name='bookmark-outline'
              size={24}
              color='black'
            />
          ),
          iconActive: (
            <MaterialCommunityIcons name='bookmark' size={24} color='#007036' />
          ),
          label: 'Album',
        },
        {
          icon: <UserAvatar size={30} />,
          iconActive: <UserAvatar size={30} />,
          label: 'Profile',
        },
      ].map((item, index) => (
        <TouchableOpacity
          key={index}
          className={`items-center justify-center py-2`}
          activeOpacity={0.7}
          onPress={() => navigate('/(tabs)/explore')}
        >
          {index === 0 ? item.iconActive : item.icon}
          <Text
            className={`text-xs mt-1 ${index === 3 ? 'text-[#007036] font-bold' : 'text-gray-500'}`}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
function UserAvatar({ size = 40 }: { size?: number }) {
  return (
    <TouchableOpacity>
      <Image
        source={{
          uri: 'https://firebasestorage.googleapis.com/v0/b/todowi-1cde9.appspot.com/o/images%2Fapp-logo.jpg?alt=media&token=e30e4cc9-26d1-4b99-9d43-3b621dfb9418',
        }}
        style={{ width: size, height: size }}
        className='rounded-full border-2 border-white'
      />
    </TouchableOpacity>
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
