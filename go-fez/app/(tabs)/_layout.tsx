import {
  FontAwesome6,
  Fontisto,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import { RootState } from '@/lib/store';
import UserAvatar from '@/components/UserAvatar';
import LanguageSelector from '@/components/LanguageSelector';
import LoginModal from '@/components/auth/LoginModal';
import SignUpModal from '@/components/auth/SignUpModal';
import HomeIcon from '@/assets/icons/home.png';
import ThemesIcon from '@/assets/icons/themes.png';
import CircuitsIcon from '@/assets/icons/circuits.png';
import AlbumIcon from '@/assets/icons/album.png';

export default function TabLayout() {
  const { bottom } = useSafeAreaInsets();
  const { user } = useSelector(
    (state: RootState) => state.auth || { user: null }
  );
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  return (
    <>
      <Tabs
        initialRouteName='index'
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopColor: '#f5f5f5ff',
            shadowOpacity: 0,
            elevation: 0,
            borderTopWidth: 1,
            height: 70,
            paddingBottom: 15,
            paddingTop: 10,
            marginBottom: bottom,
          },
          tabBarActiveTintColor: '#1a1a1a',
          tabBarInactiveTintColor: '#666666',
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
              <Ionicons name='home' size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name='themes'
          options={{
            title: 'Themes',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons
                name='palette-swatch'
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name='circuits'
          options={{
            title: 'Circuits',
            tabBarIcon: ({ color }) => (
              <Fontisto name='map' size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name='album'
          options={{
            title: 'Album',
            href: null,
            tabBarIcon: ({ color }) => (
              <FontAwesome6 name='bookmark' size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name='profile'
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) =>
              user ? (
                <View style={styles.avatarContainer}>
                  <UserAvatar user={user} size={28} />
                  {focused && <View style={styles.activeDot} />}
                </View>
              ) : (
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
        <Tabs.Screen
          name='circuit-detail'
          options={{
            href: null,
            tabBarStyle: { display: 'none' },
            tabBarIcon: ({ color }) => undefined,
          }}
        />
        <Tabs.Screen
          name='achievements'
          options={{
            href: null,
            tabBarIcon: ({ color }) => undefined,
          }}
        />
        <Tabs.Screen
          name='congrats-screen'
          options={{
            href: null,
            tabBarIcon: ({ color }) => undefined,
          }}
        />
        <Tabs.Screen
          name='all-achievements'
          options={{
            href: null,
            tabBarIcon: ({ color }) => undefined,
          }}
        />
        <Tabs.Screen
          name='circuit-route'
          options={{
            href: null,
            tabBarStyle: { display: 'none' },
            tabBarIcon: ({ color }) => undefined,
          }}
        />
      </Tabs>

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
    </>
  );
}

const styles = StyleSheet.create({
  avatarContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDot: {
    position: 'absolute',
    bottom: -4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#00b32dff',
  },
});
