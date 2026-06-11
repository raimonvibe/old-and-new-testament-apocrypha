/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Merriweather', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'theme-light':
          'linear-gradient(135deg, #faf8f3 0%, #f5f1e8 20%, #e8dcc8 45%, #d4c5a9 70%, #e8dcc8 90%, #f5f1e8 100%)',
        'theme-dark':
          'linear-gradient(135deg, #1a120c 0%, #2c1f14 25%, #3d2b1f 50%, #2c1f14 75%, #1a120c 100%)',
        'card-light':
          'linear-gradient(145deg, rgba(255,255,255,0.85) 0%, rgba(245,241,232,0.9) 50%, rgba(232,220,200,0.85) 100%)',
        'card-dark':
          'linear-gradient(145deg, rgba(61,43,31,0.95) 0%, rgba(44,31,20,0.92) 50%, rgba(35,25,18,0.95) 100%)',
        'beige-gradient':
          'linear-gradient(135deg, #f5f1e8 0%, #e8dcc8 25%, #d4c5a9 50%, #e8dcc8 75%, #f5f1e8 100%)',
        'beige-gradient-dark':
          'linear-gradient(135deg, #e8dcc8 0%, #d4c5a9 25%, #c5b494 50%, #d4c5a9 75%, #e8dcc8 100%)',
      },
      colors: {
        beige: {
          50: '#faf8f3',
          100: '#f5f1e8',
          200: '#e8dcc8',
          300: '#d4c5a9',
          400: '#c5b494',
          500: '#b5a280',
          600: '#9d8a6b',
          700: '#7d6e56',
          800: '#5e5342',
          900: '#3f382d',
        },
        brown: {
          50: '#f7f3ef',
          100: '#ebe3d9',
          200: '#d4c4b0',
          300: '#b89d82',
          400: '#9a7d5f',
          500: '#7d6349',
          600: '#634d3a',
          700: '#4d3b2e',
          800: '#3d2b1f',
          900: '#2c1f14',
          950: '#1a120c',
        },
      },
    },
  },
  plugins: [],
}
