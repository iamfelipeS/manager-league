module.exports = {
  content: [
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      screens: {
        'xs': '320px',
        // => @media (min-width: 320px) { ... }

        'sm': '640px',
        // => @media (min-width: 640px) { ... }

        'md': '768px',
        // => @media (min-width: 768px) { ... }

        '1366': '1366px',
        // => @media (min-width: 1366px) { ... }

        'lg': '1024px',
        // => @media (min-width: 1024px) { ... }

        'xl': '1280px',
        // => @media (min-width: 1280px) { ... }

        '2xl': '1536px',
        // => @media (min-width: 1536px) { ... }
      },

      minWidth: {
        '0': '0',
        '1/4': '25%',
        '1/2': '50%',
        '3/4': '75%',
        'full': '100%',
      },

      colors: {
        primary: '#377DFF',
        secondary: '#377DFF',
        blueDark: '#1278bf',
        blueMid: '#118FCF',
        blueLight: '#1da7e0',

        //BASE
        grays1: '#141718',
        grays2: '#333638',
        grays3: '#5C6265',
        grays4: '#B9BBBC',

        grays5: '#DDDEDF',
        grays6: '#F3F5F7',
        grays7: '#FAFAFA',
        white: '#FFFFFF',
      },
      keyframes: {
        'bounce-up': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },
        'bounce-down': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(3px)' },
        },
      },
      animation: {
        'bounce-up': 'bounce-up 1.2s ease-in-out infinite',
        'bounce-down': 'bounce-down 1.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
