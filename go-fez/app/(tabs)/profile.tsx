'use client';

import { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenWithHeader } from '@/components/screen';
import { Image } from 'expo-image';
import CoinImage from '@/assets/icons/coin.png';
import HomeIcon from '@/assets/icons/home.png';
import ThemesIcon from '@/assets/icons/themes.png';
import CircuitsIcon from '@/assets/icons/circuits.png';
import AlbumIcon from '@/assets/icons/album.png';
import {
  Feather,
  FontAwesome6,
  Fontisto,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
export default function ProfileScreen() {
  const router = useRouter();
  return (
    <ScreenWithHeader
      headerTitle='Profile'
      leftIcon={
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name='chevron-back' size={24} color='#fff' />
        </TouchableOpacity>
      }
      rightIcon={
        <TouchableOpacity onPress={() => {}}>
          <Feather name='settings' size={24} color='#fff' />
        </TouchableOpacity>
      }
      headerChildren={
        <View className='flex-row w-full justify-between items-center bg-[#FFFFFF33] p-4 rounded-xl'>
          <View className='flex-row items-center'>
            <Image
              style={{
                width: 50,
                height: 50,
                borderRadius: 100,
                borderColor: '#fff',
                borderWidth: 2,
              }}
              className='rounded-full'
              source={{
                uri: 'https://lh3.googleusercontent.com/ogw/AF2bZyh701yQrQKktBrUmCPLh1unsWA2blvKctfxSkA95muB93mc=s50-c-mo',
              }}
            />
            <View className='ml-3'>
              <Text className='text-white text-lg font-bold'>
                Anass Dabaghi
              </Text>
              <Text className='text-white text-sm'>Fes, Morocco</Text>
            </View>
          </View>
          <TouchableOpacity
            className='flex-row items-center gap-2'
            onPress={() => router.back()}
          >
            <View className='bg-white py-1 pl-1 pr-3 rounded-full flex-row items-center gap-2'>
              <Image
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 100,
                  borderColor: '#fff',
                  borderWidth: 2,
                }}
                className='rounded-full'
                source={CoinImage}
              />
              <Text className='text-orange-600  text-lg font-bold'>
                545,512
              </Text>
            </View>
            <Ionicons name='chevron-forward' size={24} color='#fff' />
          </TouchableOpacity>
        </View>
      }
    >
      <View className='px-6 py-8'>
        <Text className='text-gray-500 text-lg'>Main Navigation</Text>
        <View className='mt-4 space-y-4'>
          <TouchableOpacity
            className='flex-row gap-4 py-4'
            onPress={() => Alert.alert('Navigate to Settings')}
          >
            <Ionicons name='home' size={24} color='#00852cff' />
            <Text className='text-gray-800 text-xl'>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className='flex-row gap-4 py-4'
            onPress={() => Alert.alert('Navigate to Payment Methods')}
          >
            <MaterialCommunityIcons
              name='palette-swatch'
              size={24}
              color='#555'
            />
            <Text className='text-gray-800 text-xl'>Themes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className='flex-row gap-4 py-4'
            onPress={() => Alert.alert('Navigate to Ride History')}
          >
            <FontAwesome6 name='map' size={24} color='#555' />
            <Text className='text-gray-800 text-xl'>Map View</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className='flex-row gap-4 py-4'
            onPress={() => Alert.alert('Navigate to Ride History')}
          >
            <Fontisto name='map' size={24} color='#555' />
            <Text className='text-gray-800 text-xl'>Circuits</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className='flex-row gap-4 py-4'
            onPress={() => Alert.alert('Navigate to Support')}
          >
            <FontAwesome6 name='bookmark' size={24} color='#555' />
            <Text className='text-gray-800 text-xl'>Album</Text>
          </TouchableOpacity>
        </View>
        <Text className='text-gray-400 text-lg mt-4'>Info & Support</Text>
        <View className='mt-4 space-y-4'>
          <TouchableOpacity
            className='flex-row gap-4 py-4'
            onPress={() => Alert.alert('Navigate to Settings')}
          >
            <Ionicons
              name='chatbubble-ellipses-outline'
              size={24}
              color='#555'
            />
            <Text className='text-gray-800 text-xl'>Contact Support</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className='flex-row gap-4 py-4'
            onPress={() => Alert.alert('Navigate to Payment Methods')}
          >
            <Feather name='settings' size={24} color='#555' />
            <Text className='text-gray-800 text-xl'>Settings</Text>
          </TouchableOpacity>
        </View>
        <Text className='text-gray-400 text-lg mt-4'>Profile</Text>
        <View className='mt-4 space-y-4'>
          <TouchableOpacity
            className='flex-row gap-4 py-4'
            onPress={() => Alert.alert('Navigate to Settings')}
          >
            <Ionicons name='language' size={24} color='#555' />
            <Text className='text-gray-800 text-xl'>Switch Language</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className='flex-row gap-4 py-4'
            onPress={() => Alert.alert('Navigate to Payment Methods')}
          >
            <MaterialCommunityIcons name='logout' size={24} color='#555' />
            <Text className='text-gray-800 text-xl'>Log out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWithHeader>
  );
}
