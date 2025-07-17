/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pbc-blue': '#1e40af',
        'pbc-gray': '#6b7280',
        'pbc-light': '#f8fafc',
      }
    },
  },
  plugins: [],
}
