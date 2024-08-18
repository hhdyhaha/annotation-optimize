/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      height:{
        '10vh': '10vh',
        '80vh': '80vh',
        '90vh': '90vh',
        '100vh': '100vh'
      }
    },
  },
  plugins: [],
}

