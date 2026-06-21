<template>
  <div class="home-container">
    <h1>所有文章</h1>

    <!-- 文章卡片网格 -->
    <div class="post-grid">
      <mdui-card
          v-for="post in paginatedPosts"
          :key="post.slug"
          variant="elevated"
          class="post-card"
          @click="goToPost(post.slug)"
      >
        <div class="card-content">
          <h2>{{ post.title }}</h2>
          <p class="date">{{ post.date }}</p>
          <p class="excerpt">点击查看详情...</p>
        </div>
      </mdui-card>
    </div>

    <!-- 分页控件 -->
    <div class="pagination">
      <mdui-button
          variant="text"
          :disabled="currentPage === 1"
          @click="currentPage--"
      >上一页</mdui-button>

      <span>第 {{ currentPage }} / {{ totalPages }} 页</span>

      <mdui-button
          variant="text"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
      >下一页</mdui-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { allPosts } from '../utils/posts'

const router = useRouter()
const currentPage = ref(1)
const pageSize = 5 // 每页显示5篇

// 计算总页数
const totalPages = computed(() => Math.ceil(allPosts.length / pageSize))

// 计算当前页的文章
const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return allPosts.slice(start, start + pageSize)
})

// 跳转函数
const goToPost = (slug: string) => {
  router.push(`/post/${slug}`)
}
</script>

<style scoped>
.home-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

.post-grid {
  display: grid;
  gap: 20px;
  margin-bottom: 30px;
}

.post-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.post-card:hover {
  transform: translateY(-4px);
}

.card-content {
  padding: 20px;
}

.date {
  color: var(--text-secondary);
  font-size: 0.9em;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}
</style>