import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#090d16',
        },
        brand: {
          bg: 'var(--bg-primary)',
          surface: 'var(--bg-surface)',
          card: 'var(--bg-card)',
          border: 'var(--border-color)',
          'border-subtle': 'var(--border-subtle)',
          text: 'var(--text-primary)',
          'text-secondary': 'var(--text-secondary)',
          'text-muted': 'var(--text-muted)',
          accent: 'var(--accent-emerald)',
          cyan: 'var(--accent-cyan)',
          orange: 'var(--accent-orange)',
          purple: 'var(--accent-purple)',
          rose: 'var(--accent-rose)',
        },
      },
      fontFamily: {
        display: ['Outfit', '-apple-system', 'sans-serif'],
        sans: ['Inter', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
