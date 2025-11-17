import logo from '@/assets/images/app-logo.png';
import onboardingImage1 from '@/assets/images/onboarding1.png';
import onboardingImage2 from '@/assets/images/onboarding2.png';
import onboardingImage3 from '@/assets/images/onboarding3.png';
import zelijBg from '@/assets/images/zelij.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
const { width, height } = Dimensions.get('window');

const OnboardingFlow = () => {
  const router = useRouter();
  const [currentScreen, setCurrentScreen] = useState(0);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkOnboardingStatus = async () => {
    try {
      const completed = await AsyncStorage.getItem('onboardingCompleted');
      if (completed === 'true') {
        setHasCompletedOnboarding(true);
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    } finally {
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      setHasCompletedOnboarding(true);
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  const handleGetStarted = () => {
    if (currentScreen < 2) {
      setCurrentScreen(currentScreen + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
    router.replace('/(tabs)/home');
  };

  const resetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem('onboardingCompleted');
      setHasCompletedOnboarding(false);
      setCurrentScreen(0);
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
  };

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const screens = [
    <Onboarding1 onSkip={handleSkip} onNext={handleGetStarted} />,
    <Onboarding2 onSkip={handleSkip} onNext={handleGetStarted} />,
    <Onboarding3
      onSkip={handleSkip}
      onNext={() => {
        completeOnboarding();
        router.replace('/(tabs)/home');
      }}
    />,
  ];

  // Redirect to home if onboarding is completed
  useEffect(() => {
    if (hasCompletedOnboarding && !isLoading) {
      router.replace('/(tabs)/home');
    }
  }, [hasCompletedOnboarding, isLoading]);

  if (isLoading) {
    return <SplashScreen />;
  }

  if (hasCompletedOnboarding) {
    return null;
  }

  return (
    <View className='flex-1 bg-white'>
      <StatusBar barStyle='dark-content' />
      <ScreenWithBg>{screens[currentScreen]}</ScreenWithBg>
    </View>
  );
};

function SplashScreen() {
  return (
    <View className='w-full h-full flex-1 items-center justify-center bg-[#023157]'>
      <Image
        source={zelijBg}
        style={{
          width: '100%',
          height: '100%',
          top: 0,
          position: 'absolute',
          opacity: 0.3,
          transform: [{ scale: 2 }],
        }}
      />
      <LinearGradient
        colors={['#023157', '#023157', '#023157dd', '#023157cc']}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
        }}
      />

      <Image
        source={logo}
        style={{ width: 150, height: 110, zIndex: 10 }}
        tintColor='rgba(255, 255, 255, 0.7)'
      />
    </View>
  );
}

function Onboarding1({
  onSkip,
  onNext,
}: {
  onSkip: () => void;
  onNext: () => void;
}) {
  return (
    <View className='flex-1 w-full h-full'>
      <TouchableOpacity
        className='absolute top-12 right-6 z-20'
        onPress={onSkip}
      >
        <Text className='text-green-600 text-base font-semibold'>Skip</Text>
      </TouchableOpacity>

      <View
        className='flex-1 flex-row items-center justify-center'
        style={{ paddingTop: 60 }}
      >
        <View className='flex-col gap-2 px-6'>
          <View className='w-3 h-3 bg-green-600 rounded-full'></View>
          <View className='w-3 h-3 bg-gray-300 rounded-full'></View>
          <View className='w-3 h-3 bg-gray-300 rounded-full'></View>
        </View>

        <View className='flex-1 items-center justify-center'>
          <Image
            source={onboardingImage1}
            style={{ width: 200, height: 200 }}
            contentFit='contain'
          />
        </View>
      </View>

      <View
        className='bg-white rounded-t-3xl px-6 pb-12 justify-center'
        style={{
          paddingTop: 32,
          height: (4 * height) / 6,
        }}
      >
        <Text
          style={{ fontFamily: 'MainFont' }}
          className='text-lg text-green-600 font-bold mb-2'
        >
          Welcome to Go-FEZ
        </Text>
        <Text className='text-3xl font-bold text-gray-900 mb-3'>
          Discover Your City in a Smarter Way
        </Text>
        <Text className='text-gray-600 mb-8 leading-5'>
          Explore routes, find parking, and navigate the city.
        </Text>
        <View className='w-full h-1/2 flex-row-reverse items-end'>
          <TouchableOpacity
            className='bg-green-600 p-2 rounded-lg items-center justify-center w-[150px]'
            onPress={onNext}
          >
            <Text className='text-white text-base font-semibold'>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function Onboarding2({
  onSkip,
  onNext,
}: {
  onSkip: () => void;
  onNext: () => void;
}) {
  return (
    <View className='flex-1 w-full h-full'>
      <TouchableOpacity
        className='absolute top-12 right-6 z-20'
        onPress={onSkip}
      >
        <Text className='text-green-600 text-base font-semibold'>Skip</Text>
      </TouchableOpacity>

      <View
        className='flex-1 flex-row items-center justify-center '
        style={{ paddingTop: 60 }}
      >
        <View className='flex-col gap-2 px-6'>
          <View className='w-3 h-3 bg-gray-300 rounded-full'></View>
          <View className='w-3 h-3 bg-green-600 rounded-full'></View>
          <View className='w-3 h-3 bg-gray-300 rounded-full'></View>
        </View>

        <View className='flex-1 items-center justify-center'>
          <Image
            source={onboardingImage2}
            style={{ width: 200, height: 200 }}
            contentFit='contain'
          />
        </View>
      </View>

      <View
        className='bg-white rounded-t-3xl px-6 pb-12 justify-center'
        style={{ paddingTop: 32, height: (4 * height) / 6 }}
      >
        <Text
          className='text-lg text-green-600 font-bold mb-2'
          style={{ fontFamily: 'MainFont' }}
        >
          Smart Navigation
        </Text>
        <Text className='text-3xl font-bold text-gray-900 mb-3'>
          Real-Time Directions for Every Journey
        </Text>
        <Text className='text-gray-600 mb-8 leading-5'>
          Get precise routes, live traffic updates, and the fastest paths around
          town.
        </Text>

        <View className='w-full h-1/2 flex-row-reverse items-end'>
          <TouchableOpacity
            className='bg-green-600 p-2 rounded-lg items-center justify-center w-[150px]'
            onPress={onNext}
          >
            <Text className='text-white text-base font-semibold'>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function Onboarding3({
  onSkip,
  onNext,
}: {
  onSkip: () => void;
  onNext: () => void;
}) {
  return (
    <View className='flex-1 w-full h-full'>
      <TouchableOpacity
        className='absolute top-12 right-6 z-20'
        onPress={onSkip}
      >
        <Text className='text-green-600 text-base font-semibold'>Skip</Text>
      </TouchableOpacity>

      <View
        className='flex-1 flex-row items-center justify-center'
        style={{ paddingTop: 60 }}
      >
        <View className='flex-col gap-2 px-6'>
          <View className='w-3 h-3 bg-gray-300 rounded-full'></View>
          <View className='w-3 h-3 bg-gray-300 rounded-full'></View>
          <View className='w-3 h-3 bg-green-600 rounded-full'></View>
        </View>

        <View className='flex-1 items-center justify-center'>
          <Image
            source={onboardingImage3}
            style={{ width: 200, height: 200 }}
            contentFit='contain'
          />
        </View>
      </View>

      <View
        className='bg-white rounded-t-3xl px-6 pb-12 justify-center'
        style={{ paddingTop: 32, height: (4 * height) / 6 }}
      >
        <Text
          className='text-lg text-green-600 font-bold mb-2'
          style={{ fontFamily: 'MainFont' }}
        >
          Explore & Discover
        </Text>
        <Text className='text-3xl font-bold text-gray-900 mb-3'>
          Explore Points of Interest Around You
        </Text>
        <Text className='text-gray-600 mb-8 leading-5'>
          Discover attractions, restaurants, and partner offers right on your
          route.
        </Text>

        <View className='w-full h-1/2 flex-row-reverse items-end'>
          <TouchableOpacity
            className='bg-green-600 p-2 rounded-lg items-center justify-center w-[150px]'
            onPress={onNext}
          >
            <Text className='text-white text-base font-semibold'>
              Get Started
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function ScreenWithBg({ children }: { children: React.ReactNode }) {
  return (
    <View className='w-full h-full flex-1 items-center justify-center bg-gray-50'>
      <Image
        tintColor='rgba(0, 0, 0, 0.05)'
        source={zelijBg}
        style={{
          width: '100%',
          height: '100%',
          top: 0,
          position: 'absolute',
          opacity: 0.2,
          transform: [{ scale: 2 }],
        }}
      />
      <LinearGradient
        colors={['#ffffff', '#ffffff', '#ffffffcc']}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          zIndex: 1,
        }}
      />
      <SafeAreaView className='flex-1 w-full h-full' style={{ zIndex: 3 }}>
        {children}
      </SafeAreaView>
    </View>
  );
}

export default OnboardingFlow;
