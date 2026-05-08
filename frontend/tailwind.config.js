/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        app: {
          bg: '#0a0a0a',
          panel: '#141414',
          card: '#141414',
          card2: '#1c1c1e',
          border: '#262626',
          muted: '#9ca3af',
          text: '#f2f2f7',
          blue: '#3b82f6',
          green: '#10b981',
          red: '#ef4444',
          yellow: '#f59e0b',
        },
        surface: '#0a0a0a',
        card: '#141414',
        border: '#262626',
        accent: '#10b981',
        chart: {
          DEFAULT: '#10b981',
          light: '#5bd0a0'
        },
        red: '#ef4444',
        muted: '#9ca3af',
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
