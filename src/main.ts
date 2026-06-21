import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'mdui/mdui.css';
import 'mdui';
import './style.css'
import 'mdui/components/icon.js';

const app = createApp(App)
app.use(router)
app.mount('#app')