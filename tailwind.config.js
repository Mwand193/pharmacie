/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
 
    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
       colors: {
        gold: {
          50: '#fff9e6',
          100: '#ffefcc',
          200: '#ffdf99',
          300: '#ffcf66',
          400: '#ffbf33',
          500: '#ffaf00', // Gold principal
          600: '#cc8c00',
          700: '#996900',
          800: '#664600',
          900: '#332300',
        },
        blue1: '#f5fcff',
        blue2: '#dbf3fa',
        blue3: '#50b8e7',
        gres:'#0f8a3c',
        slateBlue: '#4C6E91',
      },
    },
  },
  plugins: [],
}