module.exports = {
  content: [
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ruxchai-blue': {
          DEFAULT: '#0090D3',
          70: 'rgba(0, 144, 211, 0.7)',
          50: 'rgba(0, 144, 211, 0.5)',
          30: 'rgba(0, 144, 211, 0.3)',
        },
        'ruxchai-green': {
          DEFAULT: '#3AAA35',
          70: 'rgba(58, 170, 53, 0.7)',
          50: 'rgba(58, 170, 53, 0.5)',
          30: 'rgba(58, 170, 53, 0.3)',
        },
        'ruxchai-grey': {
          DEFAULT: '#555452',
        },
      },
      perspective: {
        '1000': '1000px',
      },
      transitionDuration: {
        '600': '600ms',
      },
      borderWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [],
};
