<template>
  <div class="post-container">
    <mdui-button variant="text" @click="$router.back()">← 返回</mdui-button>
    <div v-if="post" class="markdown-body">
      <component :is="post.component" />
    </div>
    <div v-else><h2>文章未找到</h2></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { allPosts } from '../utils/posts'

const route = useRoute()
const slug = route.params.slug as string
const post = computed(() => allPosts.find(p => p.slug === slug))
</script>

<style scoped>
.post-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px;
}
</style>