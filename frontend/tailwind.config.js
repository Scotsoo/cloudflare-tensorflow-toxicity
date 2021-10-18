const heights = {
    '0': '0',
    '1/4vh': '25vh',
    '1/3vh': '33vh',
    '2/5vh': '40vh',
    '1/2vh': '50vh',
    '3/4vh': '75vh',
    'fullvh': '100vh',
}
module.exports = {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      minHeight: heights,
      maxHeight: heights,
      height: heights,
      colors: {
        'console': '#1D1D1D'
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
