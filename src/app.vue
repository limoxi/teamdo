<template>
  <div :class="theme">
    <router-view></router-view>
  </div>
</template>
<script>
import {events, EventBus} from '@/service/event_bus'
const eventBus = new EventBus()
export default {
  data() {
    return {
      theme: `aui-theme-${localStorage.getItem("theme") || 'light'}`
    }
  },
  mounted() {
    eventBus.on(events.THEME_CHANGED, newTheme => {
      this.theme = `aui-theme-${newTheme}`;
    }, 'app');
  },
  created() {

  },
  beforeDestroy() {
  },
  methods: {}
}
</script>
<style lang="less">
@import 'styles/common.less';
</style>
