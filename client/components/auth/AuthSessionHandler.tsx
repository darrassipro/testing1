'use client';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/services/slices/authSlice';
import { toast } from 'sonner';

export default function AuthSessionHandler() {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const { tokens, ...user } = session.user as any;

      if (tokens?.token) {
        dispatch(setCredentials({
          user: user,
          token: tokens.token,
          refreshToken: tokens.refreshToken
        }));
        // Toast will appear once synced
         toast.success("Connexion sociale réussie !");
      }
    }
  }, [session, status, dispatch]);

  return null;
}