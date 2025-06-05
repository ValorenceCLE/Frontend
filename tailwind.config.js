const { Input } = require('postcss');
const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        primaryDark: '#0a1f44',
        primaryMed: '#1e3a8a',
        primaryLight: '#3b82f6',
        redDark: '#440a1f',
        redMed: '#b4274c',

        // Grays & Background
        grayDark: '#212529',
        grayMed: '#909294',
        grayLight: '#d3d3d3',
        background: '#fcfcfc',

        // Relay Status Icon Background Colors
        relayStatusgreen: '#2a980c',
        relayStatusyellow: '#FFDF00',
        relayStatusred: '#eb191a',
        relayStatusgray: '#d1d5db',
        relayStatusblue: '#0a44a3',

        // Text & Button Colors
        textColor: '#333',
        buttonSelected: '#3b82f6',
        buttonUnselected: '#d3d3d3',
        buttonHover: '#1e3a8a',
      },
      backgroundImage: {
        backgroundGradient: 'radial-gradient(circle, rgba(10,31,68,1) 35%, rgba(33,37,41,1) 100%)',
        blueGradient: 'radial-gradient(circle, rgba(30,58,138,1) 35%, rgba(10,31,68,1) 100%)',
        sidebarGradient: 'radial-gradient(circle, rgba(10,31,68,1) 35%, rgba(33,37,41,1) 100%)',
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
      fontSize: {
        /* 
          Each font size entry is an array where:
          - The first element is the font-size (e.g., '1.15rem')
          - The second element is an object with:
              lineHeight: controls the space between lines (vertical rhythm)
              fontWeight: controls the thickness of the text
              color (optional): sets the default text color
          
          For example, the 'Body' entry:
          'Body': ['1.15rem', { lineHeight: '1.5rem', fontWeight: '600', color: '#333' }],
          This means:
            - The font size is 1.15rem.
            - The line height is 1.5rem, ensuring proper spacing between lines.
            - The font weight is 600, which makes it slightly bold.
            - The text color defaults to #333.
        */
        Header: ['2rem', { lineHeight: '2rem', fontWeight: 'bolder', color: '#333' }],
        Subheader: ['1.35rem', { lineHeight: '1.75rem', fontWeight: 'bold', color: '#212529' }],
        Body: ['1.15rem', { lineHeight: '1.5rem', fontWeight: '600', color: '#333' }],
        Status: ['1rem', { lineHeight: '1.25rem', fontWeight: '700', color: 'white' }],
        Navbar: ['1.5rem', { lineHeight: '4rem', fontWeight: '600', color: 'white' }],
        Form: ['1rem', { lineHeight: '1.5rem', fontWeight: '500' }],
        FormHeader: ['2.25rem', { lineHeight: '2.25rem', fontWeight: '700' }],
        FormButton: ['1.1rem', { lineHeight: '1.25rem', fontWeight: '600' }],
        FormSubmit: ['1.3rem', { lineHeight: '1.5rem', fontWeight: '600' }],
        Settings: ['1.5rem', { lineHeight: '1.75rem', fontWeight: '600' }],
        ModalHeader: ['2rem', { lineHeight: '2.1rem', fontWeight: '700' }],
        ModalSubheader: ['0.8rem', { lineHeight: '0.9rem', fontWeight: '400' }],
        MiniModalHeader: ['1.15rem', { lineHeight: '1.25rem', fontWeight: '700' }],
        MiniModalSubheader: ['0.0rem', { lineHeight: '1rem', fontWeight: '400' }],
        ModalInfo: ['1.15rem', { lineHeight: '1.25rem', fontWeight: '700' }],
        ModalButton: ['1.15rem', { lineHeight: '1.5rem', fontWeight: '500' }],
        ModalLabel: ['1rem', { lineHeight: '1rem', fontWeight: '500' }],
        ModalInput: ['1.15rem', { lineHeight: '1.15rem', fontWeight: '700' }],
        ModalBody: ['0.8rem', { lineHeight: '0.8rem', fontWeight: '400' }],
        ModalPreviewStatus: ['0.9rem', { lineHeight: '0.9rem', fontWeight: '600' }],
        ModalPreviewLabel: ['1.2rem', { lineHeight: '1.2rem', fontWeight: '700' }],
        ModalPreviewButton: ['0.9rem', { lineHeight: '0.9rem', fontWeight: '600' }],
        AddTask: ['1.15rem', { lineHeight: '1.25rem', fontWeight: '600' }],
        Input: ['1.15rem', { lineHeight: '1.15rem', fontWeight: '500' }],
        InputLabel: ['1.15rem', { lineHeight: '1.15rem', fontWeight: '600' }],
      },
    },
  },
  plugins: [
    // Custom components for common layout patterns
    plugin(function ({ addComponents, theme }) {
      const components = {
        // A full-screen centered flex container
        '.flex-center': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          position: 'relative',
        },
        // A full height flex column container
        '.flex-col-full': {
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        },
        // Example: A custom table cell style using the 'Body' font settings
        '.cell-body': {
          padding: '0.5rem 1rem', // Vertical padding: 0.5rem; Horizontal padding: 1rem
          fontWeight: 'bold',
          fontSize: theme('fontSize.Body')[0],
          // Note: If you need lineHeight or color, you can add them here as well
        },
      };
      addComponents(components);
    }),
  ],
};
