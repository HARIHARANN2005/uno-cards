/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        game: {
          bg: '#090a10',
          board: '#0f111a',
          surface: '#171926',
          card: '#1e2133',
          border: '#2a2e45',
        },
        uno: {
          red: '#ef4444',
          'red-dark': '#b91c1c',
          'red-glow': 'rgba(239, 68, 68, 0.4)',
          blue: '#3b82f6',
          'blue-dark': '#1d4ed8',
          'blue-glow': 'rgba(59, 130, 246, 0.4)',
          green: '#10b981',
          'green-dark': '#047857',
          'green-glow': 'rgba(16, 185, 129, 0.4)',
          yellow: '#f59e0b',
          'yellow-dark': '#b45309',
          'yellow-glow': 'rgba(245, 158, 11, 0.4)',
          wild: '#8b5cf6',
          'wild-dark': '#6d28d9',
          'wild-glow': 'rgba(139, 92, 246, 0.4)',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Cabinet Grotesk', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { filter: 'drop-shadow(0 0 8px currentColor)' },
          '100%': { filter: 'drop-shadow(0 0 20px currentColor)' },
        }
      },
      boxShadow: {
        'neon-red': '0 0 25px -5px rgba(239, 68, 68, 0.5)',
        'neon-blue': '0 0 25px -5px rgba(59, 130, 246, 0.5)',
        'neon-green': '0 0 25px -5px rgba(16, 185, 129, 0.5)',
        'neon-yellow': '0 0 25px -5px rgba(245, 158, 11, 0.5)',
        'neon-wild': '0 0 25px -5px rgba(139, 92, 246, 0.5)',
        'card-elevated': '0 12px 24px -6px rgba(0, 0, 0, 0.6), 0 4px 8px -2px rgba(0, 0, 0, 0.4)',
      }
    },
  },
  plugins: [],
}
