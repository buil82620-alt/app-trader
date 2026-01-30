/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'neon-green': '#66FF00',
        'bright-yellow': '#FFC700',
      },
    },
  },
  plugins: [],
};
