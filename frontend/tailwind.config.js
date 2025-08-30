/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './contexts/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#007BFF',
          dark: '#0056b3',
          light: '#cce5ff',
        },
        secondary: {
          DEFAULT: '#6c757d',
          dark: '#495057',
          light: '#f8f9fa',
        },
        success: '#28a745',
        danger: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8',
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
        secondary: ['Open Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}