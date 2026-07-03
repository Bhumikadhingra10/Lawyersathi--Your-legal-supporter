/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        gold: {
          light: '#F4E8C1',
          DEFAULT: '#D4AF37',
          dark: '#AA8C2C',
        },
        dark: {
          DEFAULT: '#111111',
          light: '#222222',
        }
      },
    },
  },
  plugins: [],
}
