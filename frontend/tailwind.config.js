/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          500: '#10b981',
          600: '#059669',
        },
        editor: {
          bg: '#0f172a',
          surface: '#1e293b',
          border: '#334155',
          active: '#3b82f6',
          trap: '#ef4444',
          accept: '#10b981'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'Courier New', 'monospace']
      }
    },
  },
  plugins: [],
}
