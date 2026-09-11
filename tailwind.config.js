/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ganesha: {
          dark: '#0B0D12',
          card: '#141824',
          border: '#23293B',
          gold: '#FFB800',
          'gold-light': '#FFE082',
          saffron: '#FF5500',
          'saffron-dark': '#CC4400',
          crimson: '#E53935',
          emerald: '#10B981',
          amber: '#F59E0B',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-gold': 'glowGold 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glowGold: {
          '0%': { boxShadow: '0 0 10px rgba(255, 184, 0, 0.2), 0 0 20px rgba(255, 184, 0, 0.1)' },
          '100%': { boxShadow: '0 0 20px rgba(255, 184, 0, 0.5), 0 0 40px rgba(255, 85, 0, 0.3)' },
        },
      },
    },
  },
  plugins: [],
}
