'use client';
// Note: This page is only useful if you want a dedicated /signup URL.
// If you only use the modal, this page might not be necessary,
// but it's good practice to have it.

import React from 'react';
import SignUp from '@/components/auth/SignUp';
import { useRouter } from '@/i18n/navigation';

export default function SignUpPage() {
  const router = useRouter();
  
  return (
    <SignUp 
      onClose={() => router.push('/')} // Go to home page when closing
      onSwitchToLogin={() => router.push('/login')} // Go to login page
    />
  );
}