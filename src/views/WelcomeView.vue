<template>
  <div class="welcome-container">
    <!-- 欢迎语部分 -->
    <div class="hero-section">
      <h1>欢迎来到Baumkuchen的博客</h1>
      <p>没有要写的</p>
    </div>

    <!-- 最新文章部分 -->
    <div class="recent-posts">
      <h2>最近更新</h2>
      <div class="post-list">
        <mdui-card
            v-for="post in recentPosts"
            :key="post.slug"
            variant="outlined"
            class="recent-card"
            @click="$router.push(`/post/${post.slug}`)"
        >
          <div class="card-content">
            <h3>{{ post.title }}</h3>
            <p class="date">{{ post.date }}</p>
          </div>
        </mdui-card>
      </div>

      <!-- 查看更多按钮 -->
      <div style="margin-top: 20px; text-align: center;">
        <mdui-button variant="text" @click="$router.push('/posts')">查看所有文章 →</mdui-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { allPosts } from '../utils/posts'

// 计算属性：只取前三篇
const recentPosts = computed(() => allPosts.slice(0, 3))
</script>

<style scoped>
.welcome-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px;
}

.hero-section {
  text-align: center;
  margin-bottom: 48px;
}

.recent-posts h2 {
  border-bottom: 2px solid var(--accent);
  display: inline-block;
  padding-bottom: 8px;
  margin-bottom: 24px;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.recent-card {
  cursor: pointer;
  transition: transform 0.2s, border-color 0.2s;
}

.recent-card:hover {
  transform: translateX(8px);
  border-color: var(--accent);
}

.card-content {
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content h3 {
  margin: 0;
  font-size: 1.1em;
}

.date {
  color: var(--text-secondary);
  font-size: 0.9em;
  margin: 0;
}
</style>