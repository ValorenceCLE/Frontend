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
        grayMed: '#909294',
        grayLight: '#d3d3d3',
        background: '#fcfcfc',
        relayGreen: '#2a980c',  
        relayYellow: '#ffff00', /*190, 73, 69*/
        relayRed: '#eb191a',
      },
      backgroundImage: {
        'backgroundGradient': 'radial-gradient(circle, rgba(10,31,68,1) 35%, rgba(33,37,41,1) 100%)',
        'blueGradient': 'radial-gradient(circle, rgba(30,58,138,1) 35%, rgba(10,31,68,1) 100%)',
        'sidebarGradient': 'radial-gradient(circle, rgba(10,31,68,1) 35%, rgba(33,37,41,1) 100%)',
        'crosshatch-pattern': `
          repeating-linear-gradient(
            45deg,
            rgba(0, 0, 0, 0.015) 0px,
            rgba(0, 0, 0, 0.015) 1px,
            transparent 1px,
            transparent 12px
          ),
          repeating-linear-gradient(
            -45deg,
            rgba(0, 0, 0, 0.015) 0px,
            rgba(0, 0, 0, 0.015) 1px,
            transparent 1px,
            transparent 12px
          )
        `,
      },
    },
  },
  plugins: [],
};
