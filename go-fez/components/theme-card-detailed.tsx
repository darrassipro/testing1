import { View, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Theme, LocalizedContent } from '@/types/theme';
import { Text } from './ui/text';
import { Star, MapPin } from 'lucide-react-native';
import { Fontisto } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type ThemeCardProps = {
  theme: Theme;
  locale?: 'en' | 'fr' | 'ar';
  onPress?: () => void;
};
const { width } = Dimensions.get('window');

export default function ThemeCardDetailed({
  theme,
  locale = 'en',
  onPress,
}: ThemeCardProps) {
  const router = useRouter();
  return (
    <TouchableOpacity
      style={{ width: width / 2 - 19 }}
      activeOpacity={0.9}
      onPress={() => {
        router.push(`/theme-details/${theme.id}`);
      }}
      className='border border-gray-100 rounded-xl '
    >
      <Image
        source={{ uri: theme.image }}
        className='w-full h-36 rounded-xl'
        resizeMode='cover'
      />
      <View
        className='flex-row items-center absolute right-3 bottom-24 bg-white px-2 py-1 rounded-full'
        style={{ borderRadius: 50 }}
      >
        <Fontisto name='map' size={12} color='black' />
        <Text className='text-xs font-semibold text-gray-900 ml-1'>
          {theme.circuitsCount} circuits
        </Text>
      </View>
      <View className='p-2'>
        <Text className='capitalize font-semibold'>{theme[locale].name}</Text>
        <Text className='mt-1 text-gray-600 text-xs'>{theme[locale].desc}</Text>
        <View className='flex-row items-center' style={{ borderRadius: 50 }}>
          <Star size={12} fill='#007036' color='#007036' />
          <Text className='text-xs font-semibold text-gray-600 mt-1 ml-1'>
            {theme.overallRating} ({Math.floor(Math.random() * 200)} reviews)
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
