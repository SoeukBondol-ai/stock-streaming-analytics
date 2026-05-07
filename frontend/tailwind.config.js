/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        app: {
          bg: '#f8fafc',
          panel: '#ffffff',
          card: '#ffffff',
          card2: '#f1f5f9',
          border: '#e2e8f0',
          muted: '#64748b',
          text: '#0f172a',
          blue: '#1068eb',
          green: '#10b981',
          red: '#ef4444',
          yellow: '#f59e0b',
        },
        surface: '#0b0d10',
        card: '#13151a',
        border: '#22252b',
        accent: '#16c784',
        chart: {
          DEFAULT: '#22c55e',
          light: '#7af2a0'
        },
        red: '#ef4444',
        muted: '#6b7280',
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
