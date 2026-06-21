<template>
  <div class="page-layout">
    <!-- 侧边栏 -->
    <mdui-navigation-rail :value="currentRouteName" class="my-sidebar">
      <div class="sidebar-header">
        <mdui-avatar src="https://avatars.githubusercontent.com/u/195563565?v=4" size="large"></mdui-avatar>
      </div>

      <mdui-navigation-rail-item
          icon="watch_later--outlined"
          value="home"
          @click="$router.push('/')"
      >主页</mdui-navigation-rail-item>

      <mdui-navigation-rail-item
          icon="image--outlined"
          value="posts"
          @click="$router.push('/posts')"
      >文章</mdui-navigation-rail-item>

      <mdui-navigation-rail-item
          icon="library_music--outlined"
          value="archive"
          @click="$router.push('/archive')"
      >归档</mdui-navigation-rail-item>
    </mdui-navigation-rail>

    <!-- 主内容区：这里会根据路由显示 WelcomeView, HomeView 或 PostView -->
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
// 用于侧边栏高亮
const currentRouteName = computed(() => route.name as string)
</script>

<style scoped>
.page-layout {
  display: flex;
  min-height: 100vh;
}
.my-sidebar {
  width: 80px;
  background-color: var(--bg-secondary);
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
  background-color: var(--bg-primary);
  overflow-y: auto;
}
</style>