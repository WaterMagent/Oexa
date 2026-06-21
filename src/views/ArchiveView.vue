<template>
  <div class="archive-container">
    <h1>文章归档</h1>

    <div class="timeline">
      <div v-for="(posts, year) in groupedPosts" :key="year" class="year-section">

        <!-- 年份标题 -->
        <div class="year-title">{{ year }}</div>

        <!-- 文章列表 -->
        <div class="posts-list">
          <div
              v-for="post in posts"
              :key="post.slug"
              class="timeline-item"
              @click="$router.push(`/post/${post.slug}`)"
          >
            <!-- 1. 时间轴节点（包含线和圆点） -->
            <div class="axis-node">
              <div class="dot"></div>
            </div>

            <!-- 2. 内容卡片 -->
            <div class="card">
              <span class="date">{{ formatDate(post.date) }}</span>
              <h3>{{ post.title }}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { allPosts } from '../utils/posts'



const groupedPosts = computed(() => {
  const groups: Record<string, typeof allPosts> = {}
  allPosts.forEach(post => {
    const year = post.date.split('-')[0]
    if (!groups[year]) groups[year] = []
    groups[year].push(post)
  })
  return groups
})

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const [, month, day] = dateStr.split('-')
  return `${month}月${day}日`
}
</script>

<style scoped>
.archive-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 20px;
}

.year-section {
  margin-bottom: 40px;
}

/* 年份标题 */
.year-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--accent);
  margin-bottom: 16px;
  /* 👇 这里控制标题的位置，你可以试着改成 60px 或更大 */
  margin-left: 35px;
}

.posts-list {
  /* 👇 关键：把整个列表（包括线和圆点）往右推 */
  margin-left: 40px;
}

.timeline-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  cursor: pointer;
}

/* 时间轴节点 */
.axis-node {
  width: 40px;
  height: 20px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

/* 竖线 */
.axis-node::before {
  content: '';
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: -20px;
  bottom: -20px;
  width: 2px;
  background-color: var(--border);
  z-index: 0;
}

.timeline-item:first-child .axis-node::before {
  top: 0;
}

/* 圆点 */
.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: var(--bg-primary);
  border: 2px solid var(--accent);
  position: relative;
  z-index: 1;
  transition: all 0.2s;
}

.timeline-item:hover .dot {
  background-color: var(--accent);
  transform: scale(1.2);
}

/* 内容卡片 */
.card {
  flex: 1;
  background-color: var(--bg-secondary);
  padding: 12px 20px;
  border-radius: 8px;
  border: 1px solid var(--border);
  transition: all 0.2s ease;
}

.timeline-item:hover .card {
  border-color: var(--accent);
  transform: translateX(5px);
}

.card h3 {
  margin: 4px 0 0;
  font-size: 1rem;
  color: var(--text-primary);
}

.date {
  font-size: 0.85rem;
  color: var(--text-secondary);
}
</style>