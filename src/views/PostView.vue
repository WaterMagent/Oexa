<template>
  <!-- 顶部返回导航 -->
  <div class="post-header">
    <mdui-button
        variant="text"
        icon="arrow_back"
        @click="$router.back()"
        class="back-btn"
    >
      返回
    </mdui-button>

    <h1 v-if="currentPost" class="post-title">{{ currentPost.title }}</h1>
  </div>

  <article class="post-content-wrapper">
    <div
        v-if="currentPost"
        class="post-content markdown-body"
        @click="handleImageClick"
    >
      <component :is="currentPost.component" />
    </div>
    <div v-else class="loading">加载中...</div>
  </article>

  <!-- 右侧悬浮目录 -->
  <ArticleToc v-if="currentPost" container-selector=".post-content" />

  <!-- 全屏图片预览遮罩 -->
  <Transition name="fade">
    <div v-if="previewSrc" class="image-preview-overlay" @click="closePreview">
      <div class="preview-container" @click.stop>
        <img :src="previewSrc" alt="Full size preview" />
        <div class="preview-hint">点击任意处关闭</div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { allPosts } from '../utils/posts'
import ArticleToc from '../components/ArticleToc.vue'

const route = useRoute()
const currentPost = computed(() =>
    allPosts.find(p => p.slug === route.params.slug)
)

// 预览相关状态
const previewSrc = ref('')

const handleImageClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (target.tagName === 'IMG') {
    previewSrc.value = (target as HTMLImageElement).src
  }
}

const closePreview = () => {
  previewSrc.value = ''
}
</script>

<style scoped>
/* --- 布局样式 --- */
.post-header {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px 20px 0;
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  --mdui-button-text-color: var(--text-secondary, #666);
  font-weight: 500;
}

.back-btn:hover {
  --mdui-button-text-color: var(--accent, #9c27b0);
}

.post-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--text-primary, #333);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-content-wrapper {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px 20px 32px;
  padding-right: 280px; /* 给右侧目录留空间 */
  min-width: 0;
}

.loading {
  text-align: center;
  padding: 60px 0;
  color: var(--text-secondary);
}

/* --- Markdown 内容样式 & 图片自适应 --- */
.post-content {
  line-height: 1.8;
  font-size: 1rem;
  color: var(--text-primary, #333);
}

.post-content :deep(img) {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 24px auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: zoom-in;
  transition: transform 0.2s;
}

.post-content :deep(img):hover {
  transform: scale(1.02);
}

.post-content :deep(h1),
.post-content :deep(h2),
.post-content :deep(h3),
.post-content :deep(h4),
.post-content :deep(h5),
.post-content :deep(h6) {
  scroll-margin-top: 100px;
}

/* --- 图片预览遮罩样式 --- */
.image-preview-overlay {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(5px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-out;
}

.preview-container {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.preview-container img {
  max-width: 100%;
  max-height: 85vh;
  object-fit: contain;
  border-radius: 4px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.preview-hint {
  margin-top: 16px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 1200px) {
  .post-content-wrapper { padding-right: 20px; }
}
</style>