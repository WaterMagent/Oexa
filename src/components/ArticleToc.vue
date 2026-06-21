<template>
  <div class="toc-container">
    <h3 class="toc-title">目录</h3>
    <nav v-if="headings.length > 0" class="toc-nav">
      <a
          v-for="(heading, index) in headings"
          :key="index"
          :href="'#' + heading.id"
          :class="['toc-link', `level-${heading.level}`, { active: activeId === heading.id }]"
          @click.prevent="scrollToHeading(heading.id)"
      >
        {{ heading.text }}
      </a>
    </nav>
    <p v-else class="toc-empty">暂无目录</p>
  </div>
</template>

<script setup lang="ts">
// ... script 部分保持不变，无需任何修改 ...
import { ref, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps<{
  containerSelector: string
}>()

const headings = ref<Array<{ id: string; text: string; level: number }>>([])
const activeId = ref('')
const route = useRoute()
let observer: IntersectionObserver | null = null

const extractHeadings = () => {
  const container = document.querySelector(props.containerSelector)
  if (!container) return
  const elements = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'))
  headings.value = elements.map((el, idx) => {
    if (!el.id) el.id = `heading-${idx}`
    return { id: el.id, text: el.textContent?.trim() || '', level: Number(el.tagName.charAt(1)) }
  })
}

const setupIntersectionObserver = () => {
  const container = document.querySelector(props.containerSelector)
  if (!container) return
  observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) activeId.value = entry.target.id })
      },
      { rootMargin: '-80px 0px -60% 0px' }
  )
  container.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(el => observer?.observe(el))
}

const scrollToHeading = (id: string) => {
  const el = document.getElementById(id)
  if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); activeId.value = id }
}

watch(() => route.path, () => {
  setTimeout(() => { extractHeadings(); setupIntersectionObserver() }, 100)
}, { immediate: true })

onUnmounted(() => observer?.disconnect())
</script>

<style scoped>
.toc-container {
  /* ✅ 关键修改：固定定位 + 垂直居中 */
  position: fixed;
  right: 40px;           /* 距离屏幕右边缘的距离 */
  top: 50%;              /* 垂直方向居中基准 */
  transform: translateY(-50%); /* 向上偏移自身高度的50%，实现完美居中 */

  width: 220px;          /* 固定宽度，避免过长标题撑开布局 */
  max-height: 70vh;      /* 限制最大高度，防止超出屏幕 */
  overflow-y: auto;      /* 内容过多时内部滚动 */

  padding: 16px;
  background: var(--bg-secondary, rgba(255, 255, 255, 0.9));
  backdrop-filter: blur(8px); /* 毛玻璃效果，提升视觉质感 */
  border-radius: 8px;
  border: 1px solid var(--border, #e5e7eb);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  z-index: 100;          /* 确保浮在正文上方 */
}

/* 自定义滚动条样式（可选） */
.toc-container::-webkit-scrollbar { width: 4px; }
.toc-container::-webkit-scrollbar-thumb { background: var(--accent, #ccc); border-radius: 2px; }

.toc-title {
  font-size: 0.9rem;
  font-weight: bold;
  margin-bottom: 12px;
  color: var(--text-primary, #333);
}

.toc-nav { display: flex; flex-direction: column; gap: 6px; }

.toc-link {
  display: block;
  font-size: 0.85rem;
  color: var(--text-secondary, #666);
  text-decoration: none;
  padding: 4px 0;
  transition: all 0.2s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.level-1 { padding-left: 0px; font-weight: 600; }
.level-2 { padding-left: 16px; }
.level-3 { padding-left: 32px; font-size: 0.8rem; }
.level-4 { padding-left: 48px; font-size: 0.75rem; }
.level-5, .level-6 { padding-left: 64px; font-size: 0.75rem; opacity: 0.7; }

.toc-link:hover { color: var(--accent, #3b82f6); }

.toc-link.active {
  color: var(--accent, #3b82f6);
  font-weight: 600;
  border-left: 2px solid var(--accent, #3b82f6);
  padding-left: calc(var(--indent, 0px) + 8px);
}

.toc-link.level-1.active { --indent: 0px; }
.toc-link.level-2.active { --indent: 16px; }
.toc-link.level-3.active { --indent: 32px; }
.toc-link.level-4.active { --indent: 48px; }
.toc-link.level-5.active,
.toc-link.level-6.active { --indent: 64px; }

.toc-empty {
  font-size: 0.8rem;
  color: var(--text-secondary, #999);
  font-style: italic;
}

/* 📱 响应式：小屏幕隐藏目录 */
@media (max-width: 1200px) {
  .toc-container { display: none; }
}
</style>