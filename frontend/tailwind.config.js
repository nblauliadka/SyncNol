/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fintech: {
          light: '#F8FAFC',
          dark: '#0B0F19',
          cardLight: '#FFFFFF',
          cardDark: '#111827',
          textLight: '#0F172A',
          textDark: '#F8FAFC',
          primary: '#2563EB',
          accent: '#3B82F6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}