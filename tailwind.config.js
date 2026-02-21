/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'nb-blue': '#4A90D9',
        'nb-navy': '#1B2F4E',
        'nb-sky': '#B8D9F0',
        'nb-bg': '#F8FAFD',
        'nb-cream': '#FAF7F2',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
