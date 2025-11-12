'use client';

import React from 'react';

interface FacebookLoginButtonProps {
  onClick?: () => void;
  color?: 'green' | 'blue';
}

export default function FacebookLoginButton({ onClick, color = 'blue' }: FacebookLoginButtonProps) {
  const colorClasses =
    color === 'green'
      ? 'border-emerald-200 hover:bg-emerald-50'
      : 'border-blue-200 hover:bg-blue-50';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center py-2.5 px-4 border rounded-lg transition-colors ${colorClasses}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
        <path d="M22.675 0h-21.35C.595 0 0 .594 0 1.326v21.348C0 23.406.595 24 1.325 24h11.494v-9.294H9.691v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.796.715-1.796 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.406 24 22.674V1.326C24 .594 23.406 0 22.675 0z"/>
      </svg>
      <span className="ml-2 text-sm font-medium text-gray-700">Facebook</span>
    </button>
  );
}
