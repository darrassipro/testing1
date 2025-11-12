'use client'

import * as React from 'react'
import countries from '../../data/countries.json'

type Country = {
  name: string
  dial_code: string
  code: string
  flag?: string
}

interface CountrySelectorProps extends React.HTMLAttributes<HTMLDivElement> {
  selectedCountry: Country
  onCountrySelect: (country: Country) => void
}

export function CountrySelector({ selectedCountry, onCountrySelect, className }: CountrySelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const toggle = () => setIsOpen((v) => !v)

  return (
    <div className={`relative ${className || ''}`}>
      <button
        type="button"
        onClick={toggle}
        className="flex items-center gap-2 h-11 px-3 rounded-md border border-gray-200 bg-white text-sm hover:bg-gray-50"
     >
        <span className="text-lg">{selectedCountry.flag || '🌐'}</span>
        <span className="font-medium text-gray-700">{selectedCountry.dial_code}</span>
        <svg className="w-4 h-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-64 max-h-72 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {countries.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => {
                onCountrySelect(c as Country)
                setIsOpen(false)
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                c.code === selectedCountry.code ? 'bg-gray-50' : ''
              }`}
            >
              <span className="text-lg">{(c as Country).flag || '🌐'}</span>
              <span className="text-gray-900 flex-1">{c.name}</span>
              <span className="text-gray-600">{c.dial_code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}


