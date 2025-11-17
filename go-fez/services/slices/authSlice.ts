import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/lib/types';

interface AuthCredentials {
  user: User;
  token: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthCredentials>) => {
      const { user, token, refreshToken } = action.payload;
      state.user = user;
      state.token = token;
      state.refreshToken = refreshToken;
      state.error = null;
      
      // Save to AsyncStorage
      AsyncStorage.setItem('user', JSON.stringify(user));
      AsyncStorage.setItem('token', token);
      AsyncStorage.setItem('refreshToken', refreshToken);
    },

    logOut: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.error = null;
      
      // Remove from AsyncStorage
      AsyncStorage.removeItem('user');
      AsyncStorage.removeItem('token');
      AsyncStorage.removeItem('refreshToken');
    },

    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        AsyncStorage.setItem('user', JSON.stringify(state.user));
      }
    },

    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    restoreAuth: (state, action: PayloadAction<AuthCredentials>) => {
      const { user, token, refreshToken } = action.payload;
      state.user = user;
      state.token = token;
      state.refreshToken = refreshToken;
    },
  },
});

export const {
  setCredentials,
  logOut,
  updateUser,
  setAuthLoading,
  setAuthError,
  restoreAuth,
} = authSlice.actions;

export default authSlice.reducer;
