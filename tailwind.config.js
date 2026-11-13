/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wood: {
          light: '#DEB887',
          DEFAULT: '#8B4513',
          dark: '#3E2723',
          panel: '#A0522D'
        }
      },
      boxShadow: {
        'wood-inset': 'inset 0 4px 8px rgba(0,0,0,0.6), inset 0 -2px 4px rgba(255,255,255,0.1)',
        '3d-screw': '0 6px 12px rgba(0,0,0,0.5), inset 0 2px 3px rgba(255,255,255,0.4)',
        'plank': '0 10px 20px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)',
      }
    },
  },
  plugins: [],
}