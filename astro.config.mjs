// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  outDir: 'build',
  vite: {
    server: {
      proxy: {
        '/api/music/lyric': {
          target: 'https://music.163.com',
          changeOrigin: true,
          rewrite: (path) => path.replace('/api/music/lyric', '/api/song/lyric'),
        },
        // Dev proxy for Netlify Functions (requires `netlify dev` on port 8888)
        '/.netlify/functions': {
          target: 'http://localhost:8888',
          changeOrigin: true,
        },
      },
    },
  },
});
