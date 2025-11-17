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
  return (
    <TouchableOpacity
      style={{ width: width / 2 - 19 }}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <Image
        source={
          (theme.image as any)?.uri
            ? { uri: (theme.image as any).uri }
            : (theme.image as any)
        }
        className='w-full h-36 rounded-2xl'
        resizeMode='cover'
      />
      <View
        className='flex-row items-center absolute top-3 left-3 bg-white px-2 py-1 rounded-full'
        style={{ borderRadius: 50 }}
      >
        <Star size={12} fill='#ffb62eff' color='#ffb62eff' />
        <Text className='text-xs font-semibold text-gray-900 ml-1'>
          {theme.overallRating}
        </Text>
      </View>
      <Text className='mt-2 capitalize text-center font-semibold'>
        {theme['en'].name}
      </Text>
    </TouchableOpacity>
  );
}
