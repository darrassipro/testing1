import { Theme } from '@/types/theme';
import { Star } from 'lucide-react-native';
import { Dimensions, Image, TouchableOpacity, View } from 'react-native';
import { Text } from './ui/text';
import { Circuit } from '@/types/circuit';

type ThemeCardProps = {
  circuit: Circuit;
  locale?: 'en' | 'fr' | 'ar';
  onPress?: () => void;
};
const { width } = Dimensions.get('window');

export default function CircuitCard({
  circuit,
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
        source={{ uri: circuit.image }}
        className='w-full h-40 rounded-2xl'
        resizeMode='cover'
      />
      <View
        className='flex-row items-center absolute top-3 right-3 bg-white px-2 py-1 rounded-full'
        style={{ borderRadius: 50 }}
      >
        <Star size={12} fill='#ff932eff' color='#ff932eff' />
        <Text className='text-xs font-semibold text-gray-900 ml-1'>
          {'4.2'}
        </Text>
      </View>
      <Text className='mt-2 capitalize text-gray-600 text-sm'>
        {circuit[locale].description}
      </Text>
      <Text className='mt-2 capitalize font-semibold text-xl'>
        {circuit[locale].name}
      </Text>
    </TouchableOpacity>
  );
}
