import {createApp} from 'vue'
import {createPinia} from 'pinia'
import {createRouter, createWebHistory} from 'vue-router'
import App from './app.vue'
import Routers from './router.js'
import ViewUIPlus from 'view-ui-plus'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import '@/business/event_bus'
import 'remixicon/fonts/remixicon.css'
import 'vue3-colorpicker/style.css'
import 'view-ui-plus/dist/styles/viewuiplus.css'
import Cookies from 'js-cookie'
import './echarts'

const router = createRouter({
  history: createWebHistory(),
  routes: Routers,
  scrollBehavior() {
    return {top: 0}
  }
})

router.beforeEach((to, from, next) => {
  if (to.path === '/') {
    let token = Cookies.get('token')
    if (token) {
      next('/projects')
      return
    }
  }
  ViewUIPlus.LoadingBar.start()
  window.document.title = to.meta.title || 'Teamdo'
  next()
})

router.afterEach((to, from, next) => {
  ViewUIPlus.LoadingBar.finish()
  window.scrollTo(0, 0)
})

const app = createApp(App)
app
  .use(router)
  .use(createPinia())
  .use(PrimeVue, {
    theme: {
      preset: Aura,
      options: {
        darkModeSelector: '.aui-theme-dark'
      }
    },
    ripple: true
  })
  .use(ViewUIPlus)
  .mount('#app')
