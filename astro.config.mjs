import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://www.lucidworks.de',
  output: 'static',
  integrations: [
    react(),
    tailwind(),
  ],
  vite: {
    ssr: {
      noExternal: ['framer-motion'],
    },
  },
});
