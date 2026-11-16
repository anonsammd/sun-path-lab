import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import netlify from '@astrojs/netlify';

export default defineConfig({
  output: 'server',
  adapter: netlify({
    edgeMiddleware: false,
  }),
  integrations: [tailwind()],
  vite: {
    plugins: [
      {
        name: 'disable-netlify-dev-edge-emulator',
        configResolved(config) {
          // Prevent Netlify Edge Deno emulator from crashing local Windows dev server
          const netlifyPlugin = config.plugins.find((p) => p && p.name === 'vite-plugin-netlify');
          if (netlifyPlugin && netlifyPlugin.configureServer) {
            delete netlifyPlugin.configureServer;
          }
        },
      },
    ],
    optimizeDeps: {
      exclude: ['@node-rs/argon2'],
    },
  },
});
