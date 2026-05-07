/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#0f1117',
        card:    '#1a1d27',
        border:  '#2a2d3a',
        accent:  '#3b82f6',
        green:   '#22c55e',
        red:     '#ef4444',
        muted:   '#6b7280',
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
