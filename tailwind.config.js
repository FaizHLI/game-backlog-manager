/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './pages/**/*.{js,ts,jsx,tsx,mdx}',
      './components/**/*.{js,ts,jsx,tsx,mdx}',
      './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'media', // or 'class' for manual dark mode toggling
    theme: {
      extend: {
        colors: {
          // Custom colors can be added here
        },
      },
    },
    plugins: [],
  }