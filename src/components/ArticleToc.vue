<template>
  <div class="toc-container">
    <h3 class="toc-title">目录</h3>

    <mdui-list v-if="headings.length > 0" class="toc-list">
      <mdui-list-item
          v-for="(heading, index) in headings"
          :key="index"
          :class="['toc-item', `level-${heading.level}`]"
          :data-id="heading.id"
          @click="scrollToHeading(heading.id)"
      >
        {{ heading.text }}
      </mdui-list-item>
    </mdui-list>

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

// ✅ 核心函数：手动修改 DOM 颜色
const updateActiveStyle = (newId: string) => {
  // 1. 获取所有目录项
  const allItems = document.querySelectorAll('.toc-item')

  allItems.forEach(item => {
    const el = item as HTMLElement
    const isActive = el.dataset.id === newId

    // 2. 设置宿主元素样式
    el.style.color = isActive ? '#6750A4' : '#666'
    el.style.fontWeight = isActive ? '600' : '400'
    el.style.backgroundColor = 'transparent'

    // 3. ✅ 关键：穿透 Shadow DOM 修改内部文字颜色
    const shadowRoot = (el as any).shadowRoot
    if (shadowRoot) {
      // 尝试查找所有可能的文字容器
      const targets = shadowRoot.querySelectorAll('*')
      targets.forEach((target: any) => {
        if (target.style) {
          target.style.color = isActive ? '#6750A4' : ''
          target.style.fontWeight = isActive ? '600' : ''
        }
      })
    }
  })
}

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
        let topElement: Element | null = null
        let minTop = Infinity

        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const rect = entry.target.getBoundingClientRect()
            if (rect.top < window.innerHeight / 2 && rect.top < minTop) {
              minTop = rect.top
              topElement = entry.target
            }
          }
        })

        if (topElement && 'id' in topElement) {
          const newId = (topElement as HTMLElement).id
          if (newId !== activeId.value) {
            activeId.value = newId
            updateActiveStyle(newId)
          }
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
    updateActiveStyle(id) // 点击时也立即更新颜色
  }
}

watch(() => route.path, () => {
  setTimeout(() => {
    extractHeadings()
    setupIntersectionObserver()
    // 初始化时高亮第一个
    if (headings.value.length > 0) {
      updateActiveStyle(headings.value[0].id)
    }
  }, 100)
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
  scrollbar-width: thin;
  scrollbar-color: #ccc transparent;
}

.toc-container::-webkit-scrollbar { width: 4px; }
.toc-container::-webkit-scrollbar-thumb { background: #ccc; border-radius: 2px; }

.toc-title {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 8px 12px;
  color: var(--text-primary, #333);
}

.toc-list { padding: 0; }

.toc-item {
  font-size: 0.85rem;
  height: 32px;
  transition: all 0.2s;
  cursor: pointer;
  display: flex !important;
  align-items: center !important;
  /* 默认颜色由 JS 控制 */
}

/* 层级缩进 */
.level-1 { --mdui-list-item-padding-left: 12px; }
.level-2 { --mdui-list-item-padding-left: 24px; }
.level-3 { --mdui-list-item-padding-left: 36px; font-size: 0.8rem; }
.level-4 { --mdui-list-item-padding-left: 48px; font-size: 0.75rem; }
.level-5, .level-6 { --mdui-list-item-padding-left: 60px; font-size: 0.75rem; opacity: 0.7; }

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