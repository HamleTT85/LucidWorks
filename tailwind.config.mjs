/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0a0a1a',
        'bg-secondary': '#12122a',
        'bg-card': '#1a1a2e',
        'accent-gold': '#c8a45c',
        'accent-gold-light': '#d4b876',
        'accent-gold-dark': '#a88a42',
        'text-primary': '#e8e4df',
        'text-secondary': '#b0aaa2',
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'hero': 'clamp(2.5rem, 8vw, 8rem)',
        'section': 'clamp(1.8rem, 4vw, 3.5rem)',
      },
      animation: {
        'scroll-indicator': 'bounce 2s infinite',
        'logo-scroll': 'logo-scroll 30s linear infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
      },
      keyframes: {
        'logo-scroll': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      transitionDuration: {
        '300': '300ms',
      },
    },
  },
  plugins: [],
};
