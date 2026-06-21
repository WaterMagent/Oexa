// src/utils/markdown.ts
import MarkdownIt from 'markdown-it'

// 创建实例
const md = new MarkdownIt({
    html: true,        // 允许 HTML 标签
    linkify: true,     // 自动识别链接
    typographer: true  // 启用一些排版优化（比如把 (c) 变成 ©）
})

export function renderMarkdown(content: string): string {
    return md.render(content)
}