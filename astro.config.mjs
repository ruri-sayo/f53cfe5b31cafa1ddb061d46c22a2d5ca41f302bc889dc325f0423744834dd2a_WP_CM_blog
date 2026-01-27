// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
// 城上コードメモ Astro設定
export default defineConfig({
  // GitHub Pagesのサブディレクトリに対応
  base: '/f53cfe5b31cafa1ddb061d46c22a2d5ca41f302bc889dc325f0423744834dd2a_WP_CM_blog',

  site: 'https://ruri-sayo.github.io',

  // Markdown設定
  markdown: {
      shikiConfig: {
          theme: 'github-dark',
      },
  },

  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
  },
});