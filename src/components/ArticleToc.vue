<template>
  <div class="toc-container">
    <h3 class="toc-title">目录</h3>

    <div v-if="headings.length > 0" class="toc-list">
      <div
          v-for="(heading, index) in headings"
          :key="index"
          :class="['toc-link', `level-${heading.level}`, { active: activeId === heading.id }]"
          @click="scrollToHeading(heading.id)"
      >
        {{ heading.text }}
      </div>
    </div>

    <div v-else class="toc-empty">暂无目录</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps<{ containerSelector: string }>()
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
        // ✅ 1. 明确指定类型为 HTMLElement | null
        let topElement: HTMLElement | null = null
        let minTop = Infinity

        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // ✅ 2. 将 entry.target 断言为 HTMLElement
            const target = entry.target as HTMLElement
            const rect = target.getBoundingClientRect()

            if (rect.top < window.innerHeight / 2 && rect.top < minTop) {
              minTop = rect.top
              topElement = target
            }
          }
        })

        // ✅ 3. 此时 TypeScript 知道 topElement 是 HTMLElement，可以安全访问 .id
        if (topElement) {
          activeId.value = topElement.id
        }
      },
      {
        root: null,
        threshold: 0,
        rootMargin: '-100px 0px -50% 0px'
      }
  )

  container.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(el => observer?.observe(el))
}
const scrollToHeading = (id: string) => {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    activeId.value = id
  }
}

watch(() => route.path, () => {
  setTimeout(() => { extractHeadings(); setupIntersectionObserver() }, 100)
}, { immediate: true })

onUnmounted(() => observer?.disconnect())
</script>

<style scoped>
.toc-container {
  position: fixed;
  right: 40px;
  top: 50%;
  transform: translateY(-50%);
  width: 240px;
  max-height: 70vh;
  overflow-y: auto;
  padding: 12px;
  background: var(--bg-secondary, rgba(255, 255, 255, 0.95));
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid var(--border, #e5e7eb);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  z-index: 100;
}

.toc-title {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 8px 12px;
  color: var(--text-primary, #333);
}

.toc-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* ✅ 核心：完全手写的链接样式，模仿 MDUI 但完全可控 */
.toc-link {
  display: block;
  padding: 6px 12px;
  font-size: 0.85rem;
  color: #FFFFFF; /* 默认灰色 */
  text-decoration: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ✅ 激活状态：紫色文字，无背景 */
.toc-link.active {
  color: #6750A4 !important; /* 强制紫色 */
  font-weight: 700;
}

/* 悬停效果 */
.toc-link:hover {
  color: #6750A4;
  background-color: rgba(156, 39, 176, 0.05);
}

/* 层级缩进 */
.level-1 { padding-left: 12px; }
.level-2 { padding-left: 24px; }
.level-3 { padding-left: 36px; font-size: 0.8rem; }
.level-4 { padding-left: 48px; font-size: 0.75rem; }
.level-5, .level-6 { padding-left: 60px; font-size: 0.75rem; opacity: 0.7; }

.toc-empty {
  font-size: 0.8rem;
  color: var(--text-secondary, #999);
  padding: 12px;
  text-align: center;
}

@media (max-width: 1200px) {
  .toc-container { display: none; }
}
</style>