/// <reference types="vite/client" />

// 👇 为 markdown-it-katex 添加类型声明
declare module 'markdown-it-katex' {
    import type { PluginSimple } from 'markdown-it'
    const katex: PluginSimple
    export default katex
}