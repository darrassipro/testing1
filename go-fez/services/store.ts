import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { themeApi } from './api/themeApi';
import { circuitApi } from './api/circuitApi';
import { poiApi } from './api/poiApi';
import authReducer from '../services/slices/authSlice';
import userApi from '../services/api/UserApi';
import { categoryApi } from '../services/api/categoryApi';
import { circuitProgressApi } from '../services/api/CircuitProgressApi';
import routeApi from '../services/api/RouteApi';
import gamificationApi from '../services/api/gamificationApi';
import reviewApi from '../services/api/reviewApi';
import shareApi from '../services/api/shareApi';
import cityApi from '../services/api/cityApi';

export const store = configureStore({
  reducer: {
    [themeApi.reducerPath]: themeApi.reducer,
    [circuitApi.reducerPath]: circuitApi.reducer,
    [poiApi.reducerPath]: poiApi.reducer,
    auth: authReducer,
    [userApi.reducerPath]: userApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    [circuitProgressApi.reducerPath]: circuitProgressApi.reducer,
    [routeApi.reducerPath]: routeApi.reducer,
    [gamificationApi.reducerPath]: gamificationApi.reducer,
    [reviewApi.reducerPath]: reviewApi.reducer,
    [shareApi.reducerPath]: shareApi.reducer,
    [cityApi.reducerPath]: cityApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredPaths: ['auth.user'],
        ignoredActions: [
          'auth/setCredentials',
          'auth/restoreAuth',
          'userApi/subscriptions/unsubscribeQueryResult',
          'userApi/mutations/removeMutationResult',
        ],
      },
    })
      .concat(themeApi.middleware)
      .concat(circuitApi.middleware)
      .concat(poiApi.middleware)
      .concat(userApi.middleware)
      .concat(categoryApi.middleware)
      .concat(circuitProgressApi.middleware)
      .concat(routeApi.middleware)
      .concat(gamificationApi.middleware)
      .concat(reviewApi.middleware)
      .concat(shareApi.middleware)
      .concat(cityApi.middleware),
});

// Configuration pour les listeners RTK Query (refetchOnFocus, etc.)
setupListeners(store.dispatch);

// Types pour TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
