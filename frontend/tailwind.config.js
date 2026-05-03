/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#d9eaff",
          600: "#1d4ed8",
          700: "#1d3fa6",
        },
      },
    },
  },
  plugins: [],
};
