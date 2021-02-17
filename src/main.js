import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './app.vue';
import Routers from './router.js';
import ViewUI from 'view-design';
import 'view-design/dist/styles/iview.css';
import ElementUI from 'element-ui';
import { ElementTiptapPlugin } from 'element-tiptap';
import 'element-ui/lib/theme-chalk/index.css';
import 'element-tiptap/lib/index.css';

Vue.use(VueRouter);
Vue.use(ViewUI);
Vue.use(ElementUI);
Vue.use(ElementTiptapPlugin, {
  lang: "zh",
  spellcheck: true
});

// The routing configuration
const RouterConfig = {
  mode: 'history',
  routes: Routers
};
const router = new VueRouter(RouterConfig);

router.beforeEach((to, from, next) => {
  ViewUI.LoadingBar.start();
  window.document.title = to.meta.title || 'iScrum';
  next();
});

router.afterEach((to, from, next) => {
  ViewUI.LoadingBar.finish();
  window.scrollTo(0, 0);
});

window.EventBus = new Vue();

new Vue({
  el: '#app',
  router: router,
  render: h => h(App)
});
