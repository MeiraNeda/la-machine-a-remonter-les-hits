/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        '80s': ['"Press Start 2P"', 'sans-serif'], // police rétro (on l’ajoutera plus tard via Google Fonts)
      },
      colors: {
        neon: {
          pink: '#ff00ff',
          blue: '#00ffff',
          green: '#00ff00',
        }
      }
    },
  },
  plugins: [],
}