// src/utils/posts.ts

export interface PostMeta {
    title: string
    date: string
    slug: string
    component: any
}

// 1. 导入组件用于渲染
const modules = import.meta.glob('../posts/*.md', { eager: true })

// 2. 【关键修改】使用 query 参数获取原始文本，而不是拼在路径里
// 这种写法在 Vite 5/6/7/8 中兼容性最好
const rawModules = import.meta.glob('../posts/*.md', {
    eager: true,
    query: '?raw',
    import: 'default'
}) as Record<string, string>

export const allPosts: PostMeta[] = Object.keys(modules).map((path) => {
    const mod = modules[path] as any
    const rawContent = rawModules[path]

    let title = ''
    let date = ''

    // === 核心解析逻辑 ===
    if (rawContent && typeof rawContent === 'string') {
        // 匹配 YAML 头部中的 title 和 date
        const tMatch = rawContent.match(/^title:\s*(.+)$/m)
        const dMatch = rawContent.match(/^date:\s*(.+)$/m)

        if (tMatch) title = tMatch[1].trim()
        if (dMatch) date = dMatch[1].trim()
    }

    // === 兜底：如果解析失败，使用美化后的文件名 ===
    if (!title) {
        const fileName = path.split('/').pop()?.replace('.md', '') || 'unknown'
        title = fileName.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    }

    const fileName = path.split('/').pop()?.replace('.md', '') || ''

    return {
        title: title,
        date: date,
        slug: fileName,
        component: mod.default
    }
}).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())