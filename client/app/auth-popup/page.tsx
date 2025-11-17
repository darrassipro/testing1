'use client';

import { useEffect } from 'react';

export default function AuthPopupPage() {
  useEffect(() => {
    // 1. Notify the main window that auth is complete
    // We use '*' for simplicity in dev, but ideally use your domain in prod
    window.opener?.postMessage({ type: 'SOCIAL_LOGIN_SUCCESS' }, '*');
    
    // 2. Close this popup window
    window.close();
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Connexion réussie...</p>
        <p className="text-sm text-gray-400">Fermeture de la fenêtre</p>
      </div>
    </div>
  );
}