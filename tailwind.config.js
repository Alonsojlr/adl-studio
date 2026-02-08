/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'kurion-dark': '#235250',
        'kurion-green': '#45ad98',
        'kurion-blue': '#33b4e9',
      },
      fontFamily: {
        'sans': ['Outfit', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
}
