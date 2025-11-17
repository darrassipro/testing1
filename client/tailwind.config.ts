import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./i18n/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class", "class"],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        },
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      fontFamily: {
        sans: [
          'var(--font-roboto)',
          'var(--font-tajawal)',
          'var(--font-ibm-plex-sans-arabic)',
          'var(--font-cairo)',
          'sans-serif'
        ],
        cairo: [
          'var(--font-cairo)',
          'sans-serif'
        ],
        tajawal: [
          'var(--font-tajawal)',
          'sans-serif'
        ],
        arabic: [
          'var(--font-ibm-plex-sans-arabic)',
          'sans-serif'
        ],
        roboto: [
          'var(--font-roboto)',
          'var(--font-tajawal)',
          'var(--font-ibm-plex-sans-arabic)',
          'var(--font-cairo)',
          'sans-serif'
        ],
        sixcaps: [
          'var(--font-six-caps)',
          'var(--font-tajawal)',
          'var(--font-ibm-plex-sans-arabic)',
          'var(--font-cairo)',
          'sans-serif'
        ],
        poppins: [
          'Poppins',
          'var(--font-poppins)',
          'sans-serif'
        ],
        mulish: [
          'var(--font-mulish)',
          'sans-serif'
        ],
        mono: [
          'var(--font-geist-sans)',
          'monospace'
        ],
        noodle: [
          'BigNoodleTitling',
          'Impact',
          'sans-serif'
        ]
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-in-from-bottom': 'slideInFromBottom 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': {
            opacity: '0'
          },
          '100%': {
            opacity: '1'
          }
        },
        slideIn: {
          '0%': {
            transform: 'translateX(-100%)'
          },
          '100%': {
            transform: 'translateX(0)'
          }
        },
        slideInFromBottom: {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        scaleIn: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.95)'
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)'
          }
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionProperty: {
        'width': 'width',
        'spacing': 'margin, padding',
      }
    }
  },
  plugins: [
    tailwindcssAnimate,
    // RTL Support Plugin
    function({ addUtilities, addVariant }: any) {
      // Add RTL/LTR utilities
      const directionUtilities = {
        '.rtl': {
          direction: 'rtl',
        },
        '.ltr': {
          direction: 'ltr',
        },
      };
      addUtilities(directionUtilities);

      // Add RTL variant
      addVariant('rtl', '[dir="rtl"] &');
      addVariant('ltr', '[dir="ltr"] &');
    },
    // Custom utilities for the project
    function({ addUtilities }: any) {
      const newUtilities = {
        '.animate-in': {
          animationFillMode: 'backwards',
        },
        '.fade-in': {
          animation: 'fadeIn 0.3s ease-in-out',
        },
        '.slide-in-from-bottom-2': {
          animation: 'slideInFromBottom 0.3s ease-out',
        },
        '.text-balance': {
          textWrap: 'balance',
        },
        '.glass': {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-dark': {
          background: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      };
      addUtilities(newUtilities);
    },
  ],
};

export default config;