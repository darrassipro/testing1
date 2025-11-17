import { signIn, useSession } from 'next-auth/react';
import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export function useSocialPopup() {
  const { update } = useSession();

  // Listen for the "Success" message from the popup
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'SOCIAL_LOGIN_SUCCESS') {
        // Force next-auth to check the session again immediately
        await update();
        toast.success('Connexion réussie !');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [update]);

  const openPopup = useCallback(async (provider: 'google' | 'facebook') => {
    try {
      // 1. Get the Auth URL from NextAuth (don't redirect automatically)
      const result = await signIn(provider, { 
        redirect: false, 
        callbackUrl: '/auth-popup' // Redirect to our closer page
      });

      if (result?.url) {
        // 2. Calculate center position for the popup
        const width = 500;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        // 3. Open the popup
        const popup = window.open(
          result.url,
          `Login with ${provider}`,
          `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
        );
        
        if (!popup) {
          toast.error("Veuillez autoriser les pop-ups pour vous connecter.");
        }
      }
    } catch (error) {
      console.error("Popup error:", error);
      toast.error("Erreur lors de l'ouverture de la fenêtre de connexion.");
    }
  }, []);

  return { openPopup };
}