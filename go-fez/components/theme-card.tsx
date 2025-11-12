import { View, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Theme, LocalizedContent } from '@/types/theme';
import { Text } from './ui/text';
import { Star, MapPin } from 'lucide-react-native';

type ThemeCardProps = {
  theme: Theme;
  locale?: 'en' | 'fr' | 'ar';
  onPress?: () => void;
};
const { width } = Dimensions.get('window');

export default function ThemeCard({
  theme,
  locale = 'en',
  onPress,
}: ThemeCardProps) {
  const getLocalizedContent = (): LocalizedContent => {
    try {
      return JSON.parse(theme[locale]);
    } catch {
      return { name: '', desc: '' };
    }
  };

  const content = getLocalizedContent();
  const circuitCount =
    theme.circuitsCount || theme.circuitsFromThemes?.length || 0;

  return (
    <TouchableOpacity
      className='bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 mb-4'
      style={{ width: width / 2 - 19 }} //19 = 16 (pagePadding) + 3 (gap/2)
      activeOpacity={0.9}
      onPress={onPress}
    >
      <View className='relative'>
        <Image
          source={{ uri: theme.image }}
          className='w-full h-40'
          resizeMode='cover'
        />

        <View className='absolute bottom-3 right-3 bg-white rounded-full px-3 py-1.5 flex-row items-center shadow-md'>
          <MapPin size={14} color='#000' strokeWidth={2} />
          <Text className='text-sm font-semibold ml-1'>
            {circuitCount} Circuits
          </Text>
        </View>
      </View>

      <View className='p-4'>
        <Text className='text-lg font-bold text-gray-900 mb-1'>
          {content.name}
        </Text>
        <Text className='text-sm text-gray-600 mb-2' numberOfLines={2}>
          {content.desc}
        </Text>

        <View className='flex-row items-center'>
          <Star size={16} fill='#007036' color='#007036' />
          <Text className='text-sm font-semibold text-gray-900 ml-1'>4.7</Text>
          <Text className='text-sm text-gray-500 ml-1'>(64 reviews)</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
