import zelijBg from '@/assets/images/zelij.png';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from './ui/text';
const { height } = Dimensions.get('window');
export function ScreenWithHeader({
  headerTitle,
  leftIcon,
  rightIcon,
  children,
  headerChildren,
}: {
  headerTitle: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  headerChildren?: React.ReactNode;
}) {
  const { top } = useSafeAreaInsets();
  return (
    <ScrollView className='flex-1 bg-white pb-16'>
      <View
        className='bg-[#043155] w-full items-center gap-4 justify-between px-4 py-6 z-10 relative overflow-hidden'
        style={{ paddingTop: top + 20 }}
      >
        <Image
          source={zelijBg}
          style={{
            width: '100%',
            height: height / 3,
            inset: 0,
            position: 'absolute',
            // opacity: 0.3,
            transform: [{ scale: 2.5 }],
          }}
        />
        <LinearGradient
          colors={['#023157', '#023157', '#023157', '#023157dd', '#023157cc']}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={{
            transform: [{ scale: 5 }],
          }}
          className='h-full w-full z-5 absolute'
        />
        <View className='flex-row justify-between w-full py-3'>
          {leftIcon || <View style={{ width: 24 }} />}
          <Text className='text-white text-xl'>{headerTitle}</Text>
          {rightIcon || <View style={{ width: 24 }} />}
        </View>
        {headerChildren}
      </View>
      <View className='flex-1 bg-white relative'>
        <Image
          source={zelijBg}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100%',
            height: height,
            opacity: 0.7,
            transform: [{ scale: 2 }],
          }}
          tintColor='gray'
        />

        <LinearGradient
          colors={['#fefefe', '#fefefe', '#fefefe', '#fefefeee', '#fefefecc']}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: height,
            transform: [{ scale: 2 }],
          }}
        />

        <View style={{ flex: 1, position: 'relative', zIndex: 10 }}>
          {children}
        </View>
      </View>
    </ScrollView>
  );
}
