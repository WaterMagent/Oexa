import { createRouter, createWebHistory } from 'vue-router'
import App from '../App.vue'
import HomeView from '../views/HomeView.vue'
import PostView from '../views/PostView.vue'
import ArchiveView from '../views/ArchiveView.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: App, // 根路径使用 App.vue 作为布局
            children: [
                {
                    path: '', // 空路径，即 localhost:5173/
                    name: 'home',
                    component: () => import('../views/WelcomeView.vue') // 专门的主页内容
                },
                {
                    path: 'posts', // localhost:5173/posts
                    name: 'posts',
                    component: HomeView
                },
                {
                    path: 'post/:slug', // localhost:5173/post/xxx
                    name: 'post',
                    component: PostView,
                    props: true
                },
                { path: 'archive', name: 'archive', component: ArchiveView }
            ]
        }
    ]
})

export default router