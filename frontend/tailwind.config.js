module.exports = {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    minHeight: {
      '0': '0',
      '1/4vh': '25vh',
      '1/3vh': '33vh',
      '1/2vh': '50vh',
      '3/4vh': '75vh',
      'fullvh': '100vh',
    },
    height: {
      '0': '0',
      '1/4vh': '25vh',
      '1/3vh': '33vh',
      '1/2vh': '50vh',
      '3/4vh': '75vh',
      'fullvh': '100vh',
    },
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
