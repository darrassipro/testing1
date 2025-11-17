import { Ionicons } from '@expo/vector-icons';

import { ScreenWithHeader } from '@/components/screen';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity } from 'react-native';

export default function SettingsScreen() {
  const router = useRouter();
  return (
    <ScreenWithHeader
      leftIcon={
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name='chevron-back' size={24} color='#fff' />
        </TouchableOpacity>
      }
      headerTitle='Settings'
    >
      <TouchableOpacity
        onPress={() => router.push('/profile')}
        className='p-4 text-gray-700 bg-white font-bold flex items-center border-b border-gray-200 flex-row justify-between'
      >
        <Text className='text-lg'>Account informations</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name='chevron-forward' size={24} color='#1a1a1a' />
        </TouchableOpacity>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push('/profile')}
        className='p-4 text-gray-700 bg-white font-bold flex items-center border-b border-gray-200 flex-row justify-between'
      >
        <Text className='text-lg'>Password & Security</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name='chevron-forward' size={24} color='#1a1a1a' />
        </TouchableOpacity>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push('/profile')}
        className='p-4 text-gray-700 bg-white font-bold flex items-center border-b border-gray-200 flex-row justify-between'
      >
        <Text className='text-lg'>Delete account</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name='chevron-forward' size={24} color='#1a1a1a' />
        </TouchableOpacity>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push('/profile')}
        className='p-4 text-gray-700 bg-white font-bold flex items-center border-b border-gray-200 flex-row justify-between'
      >
        <Text className='text-lg text-[#F46264]'>Sign Out</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name='chevron-forward' size={24} color='#F46264' />
        </TouchableOpacity>
      </TouchableOpacity>
    </ScreenWithHeader>
  );
}
