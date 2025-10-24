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
        // Agile Self color palette from specification
        primary: {
          DEFAULT: '#2C3E50', // Deep Blue
          light: '#34495E',
          dark: '#1A252F',
        },
        secondary: {
          DEFAULT: '#16A085', // Soft Teal
          light: '#1ABC9C',
          dark: '#138D75',
        },
        accent: {
          DEFAULT: '#95A5A6', // Sage Green
          light: '#BDC3C7',
          dark: '#7F8C8D',
        },
        background: {
          DEFAULT: '#F9F9F9', // Off-White
          light: '#FFFFFF',
          dark: '#ECF0F1',
        },
        status: {
          success: '#27AE60',
          warning: '#F39C12',
          error: '#E74C3C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
