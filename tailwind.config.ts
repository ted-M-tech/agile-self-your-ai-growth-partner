import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // iOS-inspired color system
        ios: {
          blue: '#007AFF',
          indigo: '#5856D6',
          purple: '#AF52DE',
          pink: '#FF2D55',
          red: '#FF3B30',
          orange: '#FF9500',
          yellow: '#FFCC00',
          green: '#34C759',
          teal: '#5AC8FA',
          cyan: '#32ADE6',
          gray: {
            1: '#8E8E93',
            2: '#AEAEB2',
            3: '#C7C7CC',
            4: '#D1D1D6',
            5: '#E5E5EA',
            6: '#F2F2F7',
          },
          label: {
            primary: '#1C1C1E',
            secondary: '#3C3C43',
            tertiary: '#3C3C4399',
          },
        },
        // Refined Agile Self palette
        primary: {
          DEFAULT: '#007AFF', // iOS Blue
          light: '#5AC8FA',
          dark: '#0051D5',
        },
        secondary: {
          DEFAULT: '#32ADE6', // Refined Teal
          light: '#5AC8FA',
          dark: '#0071A4',
        },
        accent: {
          DEFAULT: '#8E8E93', // iOS Gray
          light: '#AEAEB2',
          dark: '#636366',
        },
        background: {
          DEFAULT: '#FFFFFF',
          secondary: '#F2F2F7',
          tertiary: '#F9F9F9',
        },
        status: {
          success: '#34C759', // iOS Green
          warning: '#FF9500', // iOS Orange
          error: '#FF3B30',   // iOS Red
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // iOS-inspired type scale
        'ios-large-title': ['34px', { lineHeight: '41px', letterSpacing: '0.374px', fontWeight: '700' }],
        'ios-title-1': ['28px', { lineHeight: '34px', letterSpacing: '0.364px', fontWeight: '700' }],
        'ios-title-2': ['22px', { lineHeight: '28px', letterSpacing: '0.352px', fontWeight: '600' }],
        'ios-title-3': ['20px', { lineHeight: '25px', letterSpacing: '0.38px', fontWeight: '600' }],
        'ios-headline': ['17px', { lineHeight: '22px', letterSpacing: '-0.408px', fontWeight: '600' }],
        'ios-body': ['17px', { lineHeight: '22px', letterSpacing: '-0.408px', fontWeight: '400' }],
        'ios-callout': ['16px', { lineHeight: '21px', letterSpacing: '-0.32px', fontWeight: '400' }],
        'ios-subheadline': ['15px', { lineHeight: '20px', letterSpacing: '-0.24px', fontWeight: '400' }],
        'ios-footnote': ['13px', { lineHeight: '18px', letterSpacing: '-0.078px', fontWeight: '400' }],
        'ios-caption-1': ['12px', { lineHeight: '16px', letterSpacing: '0px', fontWeight: '400' }],
        'ios-caption-2': ['11px', { lineHeight: '13px', letterSpacing: '0.066px', fontWeight: '400' }],
      },
      borderRadius: {
        'ios': '10px',
        'ios-lg': '14px',
        'ios-xl': '20px',
      },
      boxShadow: {
        'ios-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'ios': '0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -2px rgba(0, 0, 0, 0.06)',
        'ios-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.08)',
        'ios-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'spring-in': 'springIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        springIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
