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
      },
    },
  },
});
