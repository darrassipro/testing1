import { CurrentUserProvider } from '@/context/current-user';
import '@/global.css';
import { PortalHost } from '@rn-primitives/portal';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { restoreAuth } from '@/services/slices/authSlice';
import LoginModal from '@/components/auth/LoginModal';
import SignUpModal from '@/components/auth/SignUpModal';
import { store } from '@/services/store';

SplashScreen.preventAutoHideAsync();

function AppContent() {
  const [loaded, error] = useFonts({
    MainFont: require('@/assets/fonts/MomoTrustDisplay-Regular.ttf'),
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        const token = await AsyncStorage.getItem('token');
        const refreshToken = await AsyncStorage.getItem('refreshToken');

        if (user && token && refreshToken) {
          store.dispatch(
            restoreAuth({
              user: JSON.parse(user),
              token,
              refreshToken,
            })
          );
        } else {
          // Show auth modal if not authenticated
          setShowAuthModal(true);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setShowAuthModal(true);
      } finally {
        setHasCheckedAuth(true);
      }
    };

    if (loaded || error) {
      checkAuth();
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  if (!hasCheckedAuth) {
    return null;
  }

  return (
    <>
      <Stack>
        <Stack.Screen
          name='(tabs)'
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name='onboarding'
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name='theme-details/[id]'
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name='settings'
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name='contact-support'
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name='achievements'
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name='all-achievements'
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name='congrats-screen'
          options={{
            headerShown: false,
          }}
        />
        <PortalHost />
      </Stack>

      {authMode === 'login' ? (
        <LoginModal
          visible={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSwitchToSignUp={() => setAuthMode('signup')}
        />
      ) : (
        <SignUpModal
          visible={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSwitchToLogin={() => setAuthMode('login')}
        />
      )}
    </>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <CurrentUserProvider>
        <AppContent />
      </CurrentUserProvider>
    </Provider>
  );
}
