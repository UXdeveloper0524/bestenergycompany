import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue}",
    "./**/*.{html,js}"
  ],
  theme: {
    container: {
      center: true,
      screens: {
      sm:"640px",
      md:"768px",
      lg: "1024px",
      xl:"1280px",
      "2xl":"1536px",
      },
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
        xl: "2.5rem",
        "2xl": "3rem",
      },
    },
    extend: {
      colors: {
        primary: "#EABE3C",
        secondary: "#B7D5EA",
        tertiary: "#DEE048",
        shade: "#F5F5F5",
        navy: { DEFAULT: '#0f1f44', deep: '#0a1738', soft: '#1a2d5c' },
        gold: { DEFAULT: '#d4a23a', light: '#e6b955', dark: '#b8862a' },
        ink: '#1a1a1a',
        mist: '#f6f7fb'
      },
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
        aboreto: ["Aboreto", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
}