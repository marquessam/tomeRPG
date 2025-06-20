// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'pixel': ['"Press Start 2P"', 'monospace'],
        'nes': ['"Courier New"', 'monospace']
      },
      colors: {
        'nes-blue': '#0066cc',
        'nes-dark-blue': '#004499',
        'nes-green': '#00cc66',
        'nes-red': '#cc0000',
        'nes-yellow': '#ffcc00',
        'nes-gray': '#cccccc'
      },
      animation: {
        'typewriter': 'typewriter 2s steps(40) forwards',
        'damage': 'damage 1s ease-out forwards'
      },
      keyframes: {
        typewriter: {
          'from': { width: '0' },
          'to': { width: '100%' }
        },
        damage: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-50px)', opacity: '0' }
        }
      }
    },
  },
  plugins: [],
}
