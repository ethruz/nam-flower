/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FEFDF8',
          100: '#FDF9EC',
          200: '#FAF3D3',
          300: '#F5E9B0',
        },
        flower: {
          yellow: '#E8C547',
          gold: '#D4A017',
          green: '#4A7C59',
          brown: '#6B4226',
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    }
  },
  plugins: []
}
