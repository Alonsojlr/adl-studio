/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'kurion-dark': '#0B1F3B',
        'kurion-green': '#1E3A8A',
        'kurion-blue': '#3B82F6',
      },
      fontFamily: {
        'sans': ['Outfit', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
}
