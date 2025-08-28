/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        birthday: ['AaKeAiBeiTianTianQuanZhuLiao', 'sans-serif'],
        custom: ['AaKeAiBeiTianTianQuanZhuLiao', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
