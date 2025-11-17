/**
 * Exemple de slice Redux
 * 
 * Ce fichier montre comment créer un slice pour gérer l'état local.
 * Copiez ce fichier et adaptez-le selon vos besoins.
 * 
 * Exemple d'utilisation dans un composant :
 * 
 * import { useAppDispatch, useAppSelector } from '@/services/hooks';
 * import { setUser, clearUser } from '@/services/slices/exampleSlice';
 * 
 * function MyComponent() {
 *   const dispatch = useAppDispatch();
 *   const user = useAppSelector((state) => state.user);
 *   
 *   const handleLogin = () => {
 *     dispatch(setUser({ id: '1', name: 'John', email: 'john@example.com' }));
 *   };
 *   
 *   const handleLogout = () => {
 *     dispatch(clearUser());
 *   };
 *   
 *   return (...);
 * }
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types pour l'état
interface UserState {
  currentUser: {
    id: string;
    name: string;
    email: string;
  } | null;
  isAuthenticated: boolean;
}

// État initial
const initialState: UserState = {
  currentUser: null,
  isAuthenticated: false,
};

// Création du slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Action pour définir l'utilisateur
    setUser: (state, action: PayloadAction<UserState['currentUser']>) => {
      state.currentUser = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    
    // Action pour effacer l'utilisateur
    clearUser: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
    },
    
    // Action pour mettre à jour partiellement l'utilisateur
    updateUser: (state, action: PayloadAction<Partial<NonNullable<UserState['currentUser']>>>) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
      }
    },
  },
});

// Export des actions
export const { setUser, clearUser, updateUser } = userSlice.actions;

// Export du reducer (à ajouter dans store.ts)
export default userSlice.reducer;

