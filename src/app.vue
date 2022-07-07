<template>
  <div :class="theme">
    <router-view></router-view>
  </div>
</template>
<script>
import {events, EventBus} from '@/service/event_bus'
export default {
  data() {
    return {
      theme: `aui-theme-${localStorage.getItem("theme") || 'light'}`
    }
  },
  mounted() {
    EventBus.on(events.THEME_CHANGED, newTheme => {
      this.theme = `aui-theme-${newTheme}`;
    });
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
