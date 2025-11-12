import { View } from 'react-native';
import { ScrollView } from 'react-native';
import { Text } from './ui/text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
    <ScrollView className='flex-1 bg-white'>
      <View
        className='bg-[#043155] w-full items-center gap-4 justify-between px-4 py-6'
        style={{ paddingTop: top + 20 }}
      >
        <View className='flex-row justify-between w-full py-3'>
          {leftIcon}
          <Text className='text-white text-xl'>{headerTitle}</Text>
          {rightIcon}
        </View>
        {headerChildren}
      </View>
      <View className='flex-1 bg-white'>{children}</View>
    </ScrollView>
  );
}
