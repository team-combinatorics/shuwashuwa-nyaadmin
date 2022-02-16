import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App);

/* Init Windi.css */
// windicss layers
import 'virtual:windi-base.css'
import 'virtual:windi-components.css'
// your custom styles here
import './styles/main.css'
// windicss utilities should be the last style import
import 'virtual:windi-utilities.css'
// windicss devtools support (dev only)
import 'virtual:windi-devtools'

/* vfonts */
import 'vfonts/Lato.css'
import 'vfonts/FiraCode.css'

/* naive ui styles */
const meta = document.createElement('meta')
meta.name = 'naive-ui-style'
document.head.appendChild(meta)

/* overriding styles */
import './styles/overrides.css'

/* Init Routes and Layouts */
/* https://github.com/JohnCampionJr/vite-plugin-vue-layouts */
import { createRouter, createWebHistory } from 'vue-router'
import { setupLayouts } from 'virtual:generated-layouts'
import generatedRoutes from 'virtual:generated-pages'

const routes = setupLayouts(generatedRoutes)

const router = createRouter({
  routes,
  history: createWebHistory(),
});

app.use(router);

/* Init Vueuse/head */
import { createHead } from '@vueuse/head'
app.use(createHead());

/* Init Pinia */
import { createPinia } from 'pinia'
app.use(createPinia());


app.mount('#app');
