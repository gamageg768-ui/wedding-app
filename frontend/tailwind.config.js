/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        playfair: ['"Playfair Display"', 'serif'],
      },
      colors: {
        gold: { DEFAULT: '#c9a96e', light: '#f0e4cc', dark: '#a07840' },
        blush: { DEFAULT: '#fdf0f0', dark: '#e8b4b8' },
        warm:  { DEFAULT: '#f9f5f0', dark: '#2c1810' },
      },
    },
  },
  plugins: [],
}
