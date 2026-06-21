// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Markdown from 'vite-plugin-vue-markdown'
import katex from 'markdown-it-katex'

export default defineConfig({
  plugins: [
    vue({
      include: [/\.vue$/, /\.md$/],
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('mdui-')
        }
      }
    }),
    Markdown({
      markdownItSetup(md) {
        // 👇 关键修改：用 as any 绕过类型版本冲突
        // @ts-ignore - markdown-it-katex types mismatch with @types/markdown-it v14
        md.use(katex as any, {
          throwOnError: false,
          errorColor: '#cc0000'
        })
      }
    })
  ],
})