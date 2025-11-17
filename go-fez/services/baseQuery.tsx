import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Platform } from 'react-native';

// Pour Expo, utiliser l'IP locale si disponible, sinon localhost
// Sur un appareil physique, remplacer localhost par l'IP de votre machine
const getBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    return envUrl;
  }

  // En développement, utiliser localhost pour le web/émulateur
  // Pour les appareils physiques, vous DEVEZ définir EXPO_PUBLIC_API_URL dans .env
  if (__DEV__) {
    // Sur Android Emulator, 192.168.0.102 pointe vers localhost de la machine hôte
    if (Platform.OS === 'android') {
      return BASE_URL;
    }
    // Sur iOS Simulator, localhost fonctionne
    if (Platform.OS === 'ios') {
      return 'http://localhost:8080';
    }
    // Pour web, localhost fonctionne
    return 'http://localhost:8080';
  }

  // En production, vous DEVEZ définir EXPO_PUBLIC_API_URL
  console.warn(
    "⚠️ EXPO_PUBLIC_API_URL n'est pas défini ! Créez un fichier .env avec EXPO_PUBLIC_API_URL=http://VOTRE_IP:8080"
  );
  return 'http://localhost:8080';
};

export const BASE_URL = getBaseUrl();

export const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');
    return headers;
  },
});
