<template>
  <div class="page-layout">
    <!-- 侧边栏 -->
    <mdui-navigation-rail :value="currentView" class="my-sidebar">
      <div class="sidebar-header">
        <mdui-avatar src="https://avatars.githubusercontent.com/u/195563565?v=4" size="large"></mdui-avatar>
      </div>

      <!-- 主页按钮 -->
      <mdui-navigation-rail-item
          icon="watch_later--outlined"
          value="home"
          @click="currentView = 'home'; selectedPost = null"
      >
        主页
      </mdui-navigation-rail-item>

      <!-- 文章按钮 -->
      <mdui-navigation-rail-item
          icon="image--outlined"
          value="posts"
          @click="currentView = 'posts'; selectedPost = null"
      >
        文章
      </mdui-navigation-rail-item>

      <!-- 归档按钮 (暂时留空) -->
      <mdui-navigation-rail-item
          icon="library_music--outlined"
          value="archive"
      >
        归档
      </mdui-navigation-rail-item>
    </mdui-navigation-rail>

    <!-- 主内容区 -->
    <main class="main-content">

      <!-- 1. 主页视图 -->
      <div v-if="currentView === 'home'">
        <h1>欢迎来到Baumkuchen的博客</h1>
        <p>我是一只猫娘</p>
      </div>

      <!-- 2. 文章列表视图 -->
      <div v-else-if="currentView === 'posts' && !selectedPost">
        <h2>文章列表</h2>
        <div class="post-grid">
          <mdui-card
              v-for="post in allPosts"
              :key="post.slug"
              variant="elevated"
              class="post-card"
              @click="selectedPost = post"
          >
            <div class="card-body">
              <h3>{{ post.title }}</h3>
              <p class="date">{{ post.date }}</p>
            </div>
          </mdui-card>
        </div>
      </div>

      <!-- 3. 文章详情视图 -->
      <div v-else-if="selectedPost" class="post-detail">
        <mdui-button variant="text" @click="selectedPost = null">← 返回列表</mdui-button>
        <div class="markdown-content">
          <component :is="selectedPost.component" />
        </div>
      </div>

    </main>
  </div>
</template>

// src/App.vue
<script setup lang="ts">
import { ref } from 'vue'
import { allPosts, type PostMeta } from '../utils/posts' // 确保这行引入了

const currentView = ref('home')
const selectedPost = ref<PostMeta | null>(null)

// 👇 在这里打印，刷新页面后看控制台
console.log('🚀 调试数据:', allPosts)
// 在 App.vue 的 script setup 里
const debugPaths = import.meta.glob('../posts/*.md?raw', { eager: true })
console.log('Vite 识别到的原始文件路径:', Object.keys(debugPaths))
</script>

<style scoped>
.page-layout {
  display: flex;
  min-height: 100vh;
}

.my-sidebar {
  width: 80px; /* 导航轨默认宽度 */
}

.sidebar-header {
  height: 64px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
}

.main-content {
  flex: 1;
  padding: 32px;
  background-color: var(--bg-primary);
}

/* 文章卡片网格 */
.post-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.post-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.post-card:hover {
  transform: translateY(-4px);
  border: 1px solid var(--accent);
}

.card-body {
  padding: 16px;
}

.date {
  color: var(--text-secondary);
  font-size: 0.85em;
}

.post-detail {
  max-width: 800px;
  margin: 0 auto;
}

.markdown-content {
  margin-top: 20px;
  line-height: 1.8;
}
</style>