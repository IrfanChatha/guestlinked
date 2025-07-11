// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // for Create React App or Next.js (App/Pages Router)
    "./app/**/*.{js,ts,jsx,tsx}", // for App Router (Next.js 13+)
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
