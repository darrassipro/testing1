import { getCurrentUser, loginWithEmailAndPassword } from '@/api/auth';
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';

type User = any;

interface CurrentUserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

const CurrentUserContext = createContext<CurrentUserContextType | undefined>(
  undefined
);

export const CurrentUserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  // Note: Authentication is now handled by Redux/RTK Query in authSlice
  // This context is kept for backward compatibility but user state should be 
  // accessed via useSelector((state: RootState) => state.auth.user)
  
  return (
    <CurrentUserContext.Provider value={{ user, setUser }}>
      {children}
    </CurrentUserContext.Provider>
  );
};

export const useCurrentUser = () => {
  const context = useContext(CurrentUserContext);
  if (context === undefined) {
    throw new Error('useCurrentUser must be used within CurrentUserProvider');
  }
  return context;
};
