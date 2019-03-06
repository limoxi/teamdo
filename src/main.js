import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './app.vue';
import Routers from './router.js';
import VueQuillEditor from 'vue-quill-editor';
import iView from 'iview';
import 'iview/dist/styles/iview.css';
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

Vue.use(VueQuillEditor);
Vue.use(VueRouter);
Vue.use(iView);

// The routing configuration
const RouterConfig = {
    mode: 'history',
    routes: Routers
};
const router = new VueRouter(RouterConfig);

router.beforeEach((to, from, next) => {
    iView.LoadingBar.start();
    window.document.title = to.meta.title || 'iScrum';
    next();
});

router.afterEach((to, from, next) => {
    iView.LoadingBar.finish();
    window.scrollTo(0, 0);
});

window.EventBus = new Vue();

new Vue({
    el: '#app',
    router: router,
    render: h => h(App)
});