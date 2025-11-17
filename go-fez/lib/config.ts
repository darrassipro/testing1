// API Configuration
// Automatically detects the right URL based on platform

import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Get the device's local IP (for physical devices on same network)
const getLocalIpUrl = () => {
  // Get Expo's debug server URL which contains the computer's IP
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) {
    const ipAddress = debuggerHost.split(':')[0];
    return `http://${ipAddress}:8080`;
  }
  return 'http://localhost:8080';
};

// Determine API URL based on environment
export const API_BASE_URL = (() => {
  // Check if running in Expo Go or development build
  const isExpoGo = Constants.appOwnership === 'expo';

  if (__DEV__) {
    if (Platform.OS === 'android') {
      return Platform.select({
        android: isExpoGo ? getLocalIpUrl() : 'http://10.0.2.2:8080',
        default: getLocalIpUrl(),
      });
    } else if (Platform.OS === 'ios') {
      return isExpoGo ? getLocalIpUrl() : 'http://localhost:8080';
    } else if (Platform.OS === 'web') {
      return 'http://localhost:8080';
    }
    return getLocalIpUrl();
  } else {
    return 'https://api.gofez.com';
  }
})();

console.log('🌐 API Base URL:', API_BASE_URL);
