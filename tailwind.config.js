/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primaryDark: '#0a1f44',
        primaryMed: '#1e3a8a',
        primaryLight: '#3b82f6',
        grayDark: '#212529',
        grayLight: '#d3d3d3',
        background: '#f4f5f7',
      },
      backgroundImage: {
        'gradient': 'linear-gradient(to bottom, #0a1f44, #212529)',
      },
    },
  },
  plugins: [],
};
