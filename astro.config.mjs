import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), tailwind()],
  output: 'static',
  site: process.env.SITE || 'https://zhalex414.com',
  base: process.env.BASE_PATH || '/',
});
