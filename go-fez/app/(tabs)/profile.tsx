import { useGetGamificationProfileQuery } from '@/services/api/gamificationApi';
import CrownImage from '@/assets/gamification_icons/crown.png';
import CoinImage from '@/assets/icons/coin.png';
import { ScreenWithHeader } from '@/components/screen';
import { Image } from 'expo-image';
import { useDispatch } from 'react-redux';
import { logOut } from '@/services/slices/authSlice';
import LanguageSelector from '@/components/LanguageSelector';
import LoginModal from '@/components/auth/LoginModal';
import SignUpModal from '@/components/auth/SignUpModal';
import HomeIcon from '@/assets/icons/home.png';
import ThemesIcon from '@/assets/icons/themes.png';
import CircuitsIcon from '@/assets/icons/circuits.png';
import AlbumIcon from '@/assets/icons/album.png';
import { formatNumber } from '@/lib/utils';
import {
  Feather,
  FontAwesome6,
  Fontisto,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { useCurrentUser } from '@/context/current-user';

export default function ProfileScreen() {
  const { user } = useCurrentUser();
  const { data: gamificationProfileResponse } = useGetGamificationProfileQuery(undefined, {
    skip: !user,
  });
  const gamificationProfile = gamificationProfileResponse?.data;
  const router = useRouter();

  const dispatch = useDispatch();
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          dispatch(logOut());
          Alert.alert('Success', 'Logged out successfully');
        },
      },
    ]);
  };
  return (
    <ScreenWithHeader
      headerTitle='Profile'
      leftIcon={
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name='chevron-back' size={24} color='white' />
        </TouchableOpacity>
      }
      rightIcon={
        <TouchableOpacity
          onPress={() => {
            router.push('/settings');
          }}
        >
          <Feather name='settings' size={24} color='white' />
        </TouchableOpacity>
      }
      headerChildren={
        user ? (
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
                  uri: user.profileImage || 'https://via.placeholder.com/50',
                }}
              />
              <View className='ml-3'>
                <Text className='text-white font-bold'>
                  {user.firstName} {user.lastName}
                </Text>
                <Text className='text-white text-xs'>
                  {user?.email?.slice(0, user?.email?.indexOf('@'))}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              className='flex-row items-center gap-2'
              onPress={() => router.push('/achievements')}
            >
              <View className='bg-white py-1 pl-1 pr-3 rounded-full flex-row items-center gap-2'>
                <Image
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 100,
                    borderColor: '#fff',
                    borderWidth: 2,
                  }}
                  className='rounded-full'
                  source={CoinImage}
                />
                <Text className='text-orange-600  text-sm font-bold'>
                  {gamificationProfile?.totalPoints
                    ? formatNumber(gamificationProfile.totalPoints)
                    : '0'}
                </Text>
              </View>
              <Ionicons name='chevron-forward' size={24} color='#fff' />
            </TouchableOpacity>
          </View>
        ) : (
          <View className='flex-row w-full justify-center items-center bg-[#FFFFFF33] p-4 rounded-xl'>
            <TouchableOpacity
              className='bg-white py-2 px-6 rounded-full'
              onPress={() => setShowLoginModal(true)}
            >
              <Text className='text-emerald-600 text-lg font-bold'>Login</Text>
            </TouchableOpacity>
          </View>
        )
      }
    >
      <View className='px-6 py-8'>
        <Text className='text-gray-500 text-lg'>Main Navigation</Text>
        <View className='mt-4 space-y-4'>
          <TouchableOpacity
            className='flex-row gap-4 py-4'
            onPress={() => router.push('/home')}
          >
            <Ionicons name='home' size={24} color='#555' />
            <Text className='text-gray-800 text-xl'>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className='flex-row gap-4 py-4'
            onPress={() => router.push('/themes')}
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
            onPress={() => router.push('/explore')}
          >
            <FontAwesome6 name='map' size={24} color='#555' />
            <Text className='text-gray-800 text-xl'>Map View</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className='flex-row gap-4 py-4'
            onPress={() => router.push('/circuits')}
          >
            <Fontisto name='map' size={24} color='#555' />
            <Text className='text-gray-800 text-xl'>Circuits</Text>
          </TouchableOpacity>
        </View>
        <Text className='text-gray-400 text-lg mt-4'>Info & Support</Text>
        <View className='mt-4 space-y-4'>
          <TouchableOpacity
            className='flex-row gap-4 py-4'
            onPress={() => router.push('/contact-support')}
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
            onPress={() => router.push('/settings')}
          >
            <Feather name='settings' size={24} color='#555' />
            <Text className='text-gray-800 text-xl'>Settings</Text>
          </TouchableOpacity>
        </View>
        <Text className='text-gray-400 text-lg mt-4'>Profile</Text>
        <View className='mt-4 space-y-4'>
          <TouchableOpacity
            className='flex-row gap-4 py-4 items-center'
            onPress={() => setShowLanguageSelector(true)}
          >
            <Ionicons name='language' size={24} color='#555' />
            <Text className='text-gray-800 text-xl flex-1'>
              Switch Language
            </Text>
            {showLanguageSelector && (
              <LanguageSelector
                currentLanguage={currentLanguage}
                onLanguageChange={setCurrentLanguage}
              />
            )}
          </TouchableOpacity>
          {user && (
            <TouchableOpacity
              className='flex-row gap-4 py-4'
              onPress={handleLogout}
            >
              <MaterialCommunityIcons name='logout' size={24} color='#ef4444' />
              <Text className='text-red-500 text-xl'>Log out</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <LoginModal
        visible={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToSignUp={() => {
          setShowLoginModal(false);
          setShowSignUpModal(true);
        }}
      />
      <SignUpModal
        visible={showSignUpModal}
        onClose={() => setShowSignUpModal(false)}
        onSwitchToLogin={() => {
          setShowSignUpModal(false);
          setShowLoginModal(true);
        }}
      />
    </ScreenWithHeader>
  );
}
