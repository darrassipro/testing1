import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/lib/types';

// Define the structure of the auth data (this must match the backend)
// This interface is for the data *we pass* to setCredentials
interface AuthCredentials {
  user: User;
  token: string;
  refreshToken: string;
}

export interface AuthState {
  // Modal states
  isLoginOpen: boolean;
  isSignUpOpen: boolean;
  isForgotPasswordOpen: boolean;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  currentStep: number;
  
  // User session state
  user: User | null;
  token: string | null;
  refreshToken: string | null;
}

// This function loads the user's session from localStorage on page load
const loadState = (): AuthState => {
  try {
    const serializedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    const serializedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const serializedRefreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

    return {
      isLoginOpen: false,
      isSignUpOpen: false,
      isForgotPasswordOpen: false,
      status: 'idle',
      error: null,
      currentStep: 1,
      user: serializedUser ? JSON.parse(serializedUser) : null,
      token: serializedToken,
      refreshToken: serializedRefreshToken,
    };
  } catch (e) {
    console.warn("Could not load auth state from localStorage", e);
    // Return default initial state if loading fails
    return {
      isLoginOpen: false,
      isSignUpOpen: false,
      isForgotPasswordOpen: false,
      status: 'idle',
      error: null,
      currentStep: 1,
      user: null,
      token: null,
      refreshToken: null,
    };
  }
};

const initialState: AuthState = loadState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // --- THIS IS THE FUNCTION YOUR LOGIN COMPONENT NEEDS ---
    setCredentials: (state, action: PayloadAction<AuthCredentials>) => {
      const { user, token, refreshToken } = action.payload;
      state.user = user;
      state.token = token;
      state.refreshToken = refreshToken;
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
      }
    },

    // --- THIS FUNCTION IS FOR LOGGING OUT ---
    logOut: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      
      // Remove from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }
    },

    // --- THIS FUNCTION UPDATES USER PROFILE ---
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        
        // Update localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      }
    },

    // --- Your Modal Reducers ---
    openLoginModal: (state) => {
      state.isLoginOpen = true;
      state.isSignUpOpen = false;
      state.isForgotPasswordOpen = false;
      state.error = null;
    },
    openSignUpModal: (state) => {
      state.isSignUpOpen = true;
      state.isLoginOpen = false;
      state.isForgotPasswordOpen = false;
      state.error = null;
    },
    openForgotPasswordModal: (state) => {
      state.isForgotPasswordOpen = true;
      state.isLoginOpen = false;
      state.isSignUpOpen = false;
      state.error = null;
    },
    closeLoginModal: (state) => {
      state.isLoginOpen = false;
      state.error = null;
    },
    closeSignUpModal: (state) => {
      state.isSignUpOpen = false;
      state.error = null;
    },
    closeForgotPasswordModal: (state) => {
      state.isForgotPasswordOpen = false;
      state.error = null;
    },
    closeAllModals: (state) => {
      state.isLoginOpen = false;
      state.isSignUpOpen = false;
      state.isForgotPasswordOpen = false;
      state.error = null;
    },
    switchToSignUp: (state) => {
      state.isLoginOpen = false;
      state.isSignUpOpen = true;
      state.isForgotPasswordOpen = false;
      state.error = null;
    },
    switchToLogin: (state) => {
      state.isSignUpOpen = false;
      state.isLoginOpen = true;
      state.isForgotPasswordOpen = false;
      state.error = null;
    },
    switchToForgotPassword: (state) => {
      state.isLoginOpen = false;
      state.isSignUpOpen = false;
      state.isForgotPasswordOpen = true;
      state.error = null;
    },
    setAuthStatus: (state, action: PayloadAction<'idle' | 'loading' | 'success' | 'error'>) => {
      state.status = action.payload;
    },
    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.status = 'error';
    },
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    resetAuthState: (state) => {
      state.isLoginOpen = false;
      state.isSignUpOpen = false;
      state.isForgotPasswordOpen = false;
      state.status = 'idle';
      state.error = null;
      state.currentStep = 1;
    },
  },
});

export const {
  setCredentials,
  logOut,
  updateUser,
  openLoginModal,
  openSignUpModal,
  openForgotPasswordModal,
  closeLoginModal,
  closeSignUpModal,
  closeForgotPasswordModal,
  closeAllModals,
  switchToSignUp,
  switchToLogin,
  switchToForgotPassword,
  setAuthStatus,
  setAuthError,
  setCurrentStep,
  resetAuthState,
} = authSlice.actions;

export default authSlice.reducer;