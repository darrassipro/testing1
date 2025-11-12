import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'react-native';
import HomeIcon from '@/assets/icons/home.png';
import ThemesIcon from '@/assets/icons/themes.png';
import CircuitsIcon from '@/assets/icons/circuits.png';
import AlbumIcon from '@/assets/icons/album.png';
export default function TabLayout() {
  const { bottom } = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          backgroundColor: '#ffffffff',
          borderTopColor: '#f5f5f5ff',
          shadowOpacity: 0,
          elevation: 0,
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 15,
          paddingTop: 10,
          marginBottom: bottom,
        },
        tabBarActiveTintColor: '#00b32dff',
        tabBarInactiveTintColor: '#8a8a8aff',
        tabBarLabelStyle: {
          fontSize: 11,
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name='home'
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Image
              source={HomeIcon}
              style={{ width: 15, height: 30, objectFit: 'contain' }}
              tintColor={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='themes'
        options={{
          title: 'Themes',
          tabBarIcon: ({ color }) => (
            <Image
              source={ThemesIcon}
              style={{ width: 15, height: 30, objectFit: 'contain' }}
              tintColor={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='circuits'
        options={{
          title: 'Circuits',
          tabBarIcon: ({ color }) => (
            <Image
              source={CircuitsIcon}
              style={{ width: 15, height: 30, objectFit: 'contain' }}
              tintColor={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='album'
        options={{
          title: 'Album',
          tabBarIcon: ({ color }) => (
            <Image
              source={AlbumIcon}
              style={{ width: 15, height: 30, objectFit: 'contain' }}
              tintColor={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='profile'
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <Ionicons name='person' size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='explore'
        options={{
          title: 'Explore',
          tabBarLabel: undefined,
          href: null,
          tabBarIcon: ({ color }) => undefined,
        }}
      />
      <Tabs.Screen
        name='page'
        options={{
          href: null,
          tabBarIcon: ({ color }) => undefined,
        }}
      />
      <Tabs.Screen
        name='onboarding'
        options={{
          href: null,
          tabBarIcon: ({ color }) => undefined,
        }}
      />
      <Tabs.Screen
        name='account-info'
        options={{
          href: null,
          tabBarIcon: ({ color }) => undefined,
        }}
      />
      <Tabs.Screen
        name='index'
        options={{
          href: null,
          tabBarIcon: ({ color }) => undefined,
        }}
      />
    </Tabs>
  );
}
