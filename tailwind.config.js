/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7c3aed', // Violet
        secondary: '#1f2937', // Gray-800
        accent: '#f59e0b', // Amber
        dark: '#111827', // Gray-900
      }
    },
  },
  plugins: [],
}
