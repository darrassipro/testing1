import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../services/slices/authSlice';
import userApi from '../services/api/UserApi';
import themeApi from '../services/api/ThemeApi';
import circuitApi from '../services/api/CircuitApi';
import poiApi from '../services/api/PoiApi';
import categoryApi from '../services/api/CategoryApi';
import cityApi from '../services/api/CityApi';
import { circuitProgressApi } from '../services/api/CircuitProgressApi';
import { gamificationApi } from '../services/api/GamificationApi';
import { customCircuitApi } from '../services/api/CustomCircuitApi';
import { reviewApi } from '../services/api/ReviewApi';
import { shareApi } from '../services/api/ShareApi';
import { statisticsApi } from '../services/api/StatisticsApi';
import { partnerApi } from '../services/api/PartnerApi';
import { settingsApi } from '../services/api/SettingsApi';
import routeApi from '../services/api/RouteApi';

// 2. Import the logger
  // Charge le logger uniquement en développement pour éviter les erreurs de build

// Check for development environment
const isDevelopment = process.env.NODE_ENV === 'development';

// Crée le middleware logger uniquement en dev, sans import statique
let loggerMiddleware: any | null = null;
if (isDevelopment) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { createLogger } = require('redux-logger');
    loggerMiddleware = createLogger();
  } catch {
    loggerMiddleware = null;
  }
}

// Create a middleware array
const middleware = [
  userApi.middleware,
  themeApi.middleware,
  circuitApi.middleware,
  poiApi.middleware,
  categoryApi.middleware,
  cityApi.middleware,
  circuitProgressApi.middleware,
  gamificationApi.middleware,
  customCircuitApi.middleware,
  reviewApi.middleware,
  shareApi.middleware,
  statisticsApi.middleware,
  partnerApi.middleware,
  settingsApi.middleware,
  routeApi.middleware,
];

// 6. Ajouter le logger en dev s'il est disponible
if (isDevelopment && loggerMiddleware) {
  middleware.push(loggerMiddleware as any);
}

const configurestore = configureStore({
  reducer: {
    auth: authReducer,
    [userApi.reducerPath]: userApi.reducer,
    [themeApi.reducerPath]: themeApi.reducer,
    [circuitApi.reducerPath]: circuitApi.reducer,
    [poiApi.reducerPath]: poiApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    [cityApi.reducerPath]: cityApi.reducer,
    [circuitProgressApi.reducerPath]: circuitProgressApi.reducer,
    [gamificationApi.reducerPath]: gamificationApi.reducer,
    [customCircuitApi.reducerPath]: customCircuitApi.reducer,
    [reviewApi.reducerPath]: reviewApi.reducer,
    [shareApi.reducerPath]: shareApi.reducer,
    [statisticsApi.reducerPath]: statisticsApi.reducer,
    [partnerApi.reducerPath]: partnerApi.reducer,
    [settingsApi.reducerPath]: settingsApi.reducer,
    [routeApi.reducerPath]: routeApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredPaths: ['user.socketConnection'],
        ignoredActions: [
          'user/setSocketConnection',
          'userApi/subscriptions/unsubscribeQueryResult',
          'userApi/mutations/removeMutationResult',
          'themeApi/subscriptions/unsubscribeQueryResult',
          'themeApi/mutations/removeMutationResult',
          'circuitApi/subscriptions/unsubscribeQueryResult',
          'circuitApi/mutations/removeMutationResult',
          'poiApi/subscriptions/unsubscribeQueryResult',
          'poiApi/mutations/removeMutationResult',
          'categoryApi/subscriptions/unsubscribeQueryResult',
          'categoryApi/mutations/removeMutationResult',
          'cityApi/subscriptions/unsubscribeQueryResult',
          'cityApi/mutations/removeMutationResult',
          'circuitProgressApi/subscriptions/unsubscribeQueryResult',
          'circuitProgressApi/mutations/removeMutationResult',
          'gamificationApi/subscriptions/unsubscribeQueryResult',
          'gamificationApi/mutations/removeMutationResult',
          'customCircuitApi/subscriptions/unsubscribeQueryResult',
          'customCircuitApi/mutations/removeMutationResult',
          'reviewApi/subscriptions/unsubscribeQueryResult',
          'reviewApi/mutations/removeMutationResult',
          'shareApi/subscriptions/unsubscribeQueryResult',
          'shareApi/mutations/removeMutationResult',
          'statisticsApi/subscriptions/unsubscribeQueryResult',
          'statisticsApi/mutations/removeMutationResult',
          'partnerApi/subscriptions/unsubscribeQueryResult',
          'partnerApi/mutations/removeMutationResult',
          'settingsApi/subscriptions/unsubscribeQueryResult',
          'settingsApi/mutations/removeMutationResult',
          'routeApi/subscriptions/unsubscribeQueryResult',
          'routeApi/mutations/removeMutationResult',
        ],
      },
    })
      .concat(middleware),
  
  // Enable Redux DevTools only in development
  devTools: isDevelopment,
});

export default configurestore;
export type RootState = ReturnType<typeof configurestore.getState>;
export type AppDispatch = typeof configurestore.dispatch;