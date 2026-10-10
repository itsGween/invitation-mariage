import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { wedding } from './src/config/wedding.ts';

// Remplace %SITE_URL%, %SITE_TITRE% et %SITE_DESCRIPTION% dans index.html
// à partir de src/config/wedding.ts.
const metaDepuisConfig = {
  name: 'meta-depuis-config',
  transformIndexHtml(html: string) {
    return html
      .replaceAll('%SITE_URL%', wedding.site.url.replace(/\/+$/, ''))
      .replaceAll('%SITE_TITRE%', wedding.site.titre)
      .replaceAll('%SITE_DESCRIPTION%', wedding.site.description);
  },
};

export default defineConfig({
  plugins: [react(), metaDepuisConfig],
});
