/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      gridTemplateColumns:{
        'auto':'repeat(auto-fill, minmax(200px, 1fr))'
      },
      colors:{
        'primary':'#14B8A6',
        'secondary':'#F59E42',
        'accent':'#FDE68A',
        'background':'#F8FAFC',
        'surface':'#FFFFFF',
      }
    },
  },
  plugins: [],
}