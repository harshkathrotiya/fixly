module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/components/admin/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#8A91B5',
        secondary: '#A6B8BC',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
