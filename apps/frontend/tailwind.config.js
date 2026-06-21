/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'action-primary': '#ff6b6b',    // Coral
        'action-secondary': '#ffd166',  // Yellow
        'app-background': '#f8fafc',    // slate-50
        'app-text': '#1e293b',          // slate-800
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
