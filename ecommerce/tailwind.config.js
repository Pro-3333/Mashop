/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./views/**/*.{ejs,html}", // tous tes fichiers EJS
      "./public/js/**/*.js"      // si tu as du JS public
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  };
  