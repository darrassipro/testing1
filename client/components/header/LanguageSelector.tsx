"use client"
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { languages } from '@/lib/constants/features';
import type { LanguageSelectorProps } from '@/lib/types';
import { usePathname } from 'next/navigation';

interface ExtendedLanguageSelectorProps extends LanguageSelectorProps {
  dropUp?: boolean;
}

export default function LanguageSelector({ locale, onLanguageChange, dropUp = false }: ExtendedLanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  
  const currentLang = languages.find(lang => lang.code === locale) || languages[0];
  
  // Detect if we're on the homepage
  const isHomePage = pathname === '/' || pathname === '/en' || pathname === '/fr' || pathname === '/ar';
 
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
 
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
 
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
          isHomePage 
            ? 'bg-white/20 hover:bg-white/30 text-white' 
            : 'bg-white hover:bg-gray-50 text-gray-900 shadow-sm'
        }`}
      >
        <img 
          src={currentLang.flag} 
          alt={`${currentLang.name} flag`} 
          className="w-5 h-5 rounded-full" 
        />
        <ChevronDown 
          size={16} 
          className={`transition-transform ${isOpen ? 'rotate-180' : ''} ${
            isHomePage ? 'text-white' : 'text-gray-700'
          }`} 
        />
      </button>
 
      {isOpen && (
        <div className={`absolute right-0 bg-white rounded-lg shadow-xl overflow-hidden min-w-[200px] z-50 backdrop-blur-lg ${
          dropUp ? 'bottom-full mb-2' : 'top-full mt-2'
        }`}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                onLanguageChange(lang.code as 'en' | 'fr' | 'ar');
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition ${
                locale === lang.code ? 'bg-blue-50' : ''
              }`}
            >
              <img 
                src={lang.flag} 
                alt={`${lang.name} flag`} 
                className="w-6 h-6 rounded-full" 
              />
              <div className="flex flex-col items-start">
                <span className={`text-sm font-medium ${locale === lang.code ? 'text-blue-600' : 'text-gray-900'}`}>
                  {lang.name}
                </span>
                <span className="text-xs text-gray-500">{lang.country}</span>
              </div>
              {locale === lang.code && (
                <span className="ml-auto text-blue-600">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}