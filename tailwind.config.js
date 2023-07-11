/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        '.transition-smooth': {
          transitionDuration: '250ms',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        },
      };
      addUtilities(newUtilities);
    },
  ],
};
