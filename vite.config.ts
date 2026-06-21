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
          // ✅ 关键：将所有 mdui- 开头的标签视为自定义元素
          isCustomElement: (tag) => tag.startsWith('mdui-')
        }
      }
    }),
    Markdown({
      markdownItSetup(md) {
        // @ts-ignore
        md.use(katex as any, {
          throwOnError: false,
          errorColor: '#cc0000'
        })
      }
    })
  ],
})