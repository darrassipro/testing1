'use client';

import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';

export default function HomeScreen() {
  const hasCompletedOnboarding = false; // Replace with actual logic

  if (hasCompletedOnboarding) {
    return <Redirect href='/home' />;
  }
  return <Redirect href='/onboarding' />;
}
