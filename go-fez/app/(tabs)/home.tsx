import mapIcon from '@/assets/icons/map-icon.png';
import meditationIcon from '@/assets/icons/meditation.png';
import museumIcon from '@/assets/icons/museum.png';
import officeIcon from '@/assets/icons/office-building.png';
import potteryIcon from '@/assets/icons/pottery.png';
import saladIcon from '@/assets/icons/salad.png';
import themeIcon from '@/assets/icons/theme icon.png';
import Image1 from '@/assets/images/explore1.jpg';
import Image2 from '@/assets/images/explore2.jpg';
import goFezLogo from '@/assets/images/go-fez-log-no-text.png';
import zelijBg from '@/assets/images/zelij.png';
import ThemeCard from '@/components/theme-card';
import { UserAvatar } from '@/components/user-avatar';
import { Theme } from '@/types/theme';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as StatusBar from 'expo-status-bar';
import { useEffect, useState } from 'react';
import ArchImg from '@/assets/themes/architecture.png';
import GasImg from '@/assets/themes/gastronomy.jpg';
import HistImg from '@/assets/themes/history.jpg';
import SpirImg from '@/assets/themes/spiritual.jpg';
import TradImg from '@/assets/themes/traditional.jpg';
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
import { getAllThemes } from '@/api/theme';
import ThemeCardDetailed from '@/components/theme-card-detailed';
import { useGetAllCategoriesQuery } from '@/services/api/categoryApi';
import { getCategoryIcon, getCategoryName } from '@/lib/categoryUtils';

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
const { width } = Dimensions.get('window');
export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [inViewImageIndex, setInViewImageIndex] = useState(0);
  const [themes, setThemes] = useState<Theme[]>([]);
  useEffect(() => {
    getAllThemes()
      .then(setThemes)
      .catch((error) => {
        console.error('Error fetching themes:', error);
      });
  }, []);
  // const { user } = useCurrentUser();
  return (
    <View className='flex-1 bg-white'>
      <ScrollView className='flex-1 ' showsVerticalScrollIndicator={false}>
        <PageHeader
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onSearchQueryChange={setSearchQuery}
          currentUser={null}
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
            renderItem={(item) => <ThemeCardDetailed theme={item.item} />}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={{ gap: 6, marginBottom: 12 }}
          />
        </View>
      </ScrollView>
    </View>
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
    StatusBar.setStatusBarStyle('light');
  }, []);
  const { top } = useSafeAreaInsets();

  // Récupération des catégories depuis le backend
  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useGetAllCategoriesQuery();

  // Préparer les catégories à afficher (limiter à 8 comme dans la version web)
  const categoriesArray = categoriesData?.data || [];
  const displayCategories = categoriesArray.slice(0, 8);

  // Ne pas afficher la section si erreur ET pas de données
  const hasData = categoriesArray.length > 0;
  const shouldShowCategories = hasData || isLoadingCategories;

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

      {/* Categories - Affichage uniquement si données disponibles ou en chargement */}
      {shouldShowCategories && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className='mb-2 mx-auto'
          contentContainerStyle={{ gap: 8, flexDirection: 'row' }}
        >
          {isLoadingCategories && !hasData
            ? // Skeleton loading (similaire à la version web)
              Array.from({ length: 4 }).map((_, index) => (
                <View key={index} className='items-center'>
                  <View className='items-center justify-center w-16 h-16 rounded-xl border-2 border-white bg-white/20'>
                    <ActivityIndicator size='small' color='white' />
                  </View>
                  <View className='mt-1 w-12 h-3 bg-white/20 rounded' />
                </View>
              ))
            : // Affichage des catégories du backend
              displayCategories.map((category: any) => {
                const categoryName = getCategoryName(category, 'fr');
                const categoryIcon = getCategoryIcon(category);
                const isSelected = selectedCategory === category.id;

                return (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => onCategoryChange?.(category.id)}
                    activeOpacity={0.7}
                    className='items-center'
                  >
                    <View
                      className={`items-center justify-center w-16 h-16 rounded-xl border-2 border-white ${
                        isSelected ? 'border-green-700 bg-white' : 'bg-white'
                      }`}
                    >
                      {categoryIcon ? (
                        <Image
                          source={{ uri: categoryIcon }}
                          style={{ width: 24, height: 24 }}
                          resizeMode='contain'
                        />
                      ) : (
                        <Feather
                          name='image'
                          size={24}
                          color={isSelected ? 'green' : '#6b7280'}
                        />
                      )}
                    </View>
                    <Text
                      className='mt-1 text-white text-xs text-center'
                      numberOfLines={1}
                    >
                      {categoryName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
        </ScrollView>
      )}
    </View>
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
