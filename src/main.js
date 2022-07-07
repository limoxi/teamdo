import {createApp} from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './app.vue'
import Routers from './router.js'
import ViewUIPlus from 'view-ui-plus'
import '@/service/event_bus'
import 'view-ui-plus/src/styles/index.less'

const router = createRouter({
  history: createWebHistory(),
  routes: Routers,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  ViewUIPlus.LoadingBar.start();
  window.document.title = to.meta.title || 'Teamdo';
  next();
});

router.afterEach((to, from, next) => {
  ViewUIPlus.LoadingBar.finish();
  window.scrollTo(0, 0);
});

const app = createApp(App)
app
  .use(router)
  .use(ViewUIPlus)
  .mount('#app')
