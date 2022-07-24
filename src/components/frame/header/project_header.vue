<template>
  <div class="aui-header">
    <logo></logo>
    <div class="aui-i-menu">
      <Menu mode="horizontal" :theme="menuTheme" :active-name="activeName" @on-select="onMenuChanged">
        <MenuItem name="projects">项目</MenuItem>
<!--        <MenuItem name="sprint">迭代</MenuItem>-->
        <MenuItem name="kanban">看板</MenuItem>
<!--        <MenuItem name="tasks">用户故事</MenuItem>-->
<!--        <MenuItem name="state">统计</MenuItem>-->
        <MenuItem name="members">成员</MenuItem>
        <MenuItem name="tags">标签</MenuItem>
<!--        <MenuItem name="settings">管理</MenuItem>-->
      </Menu>
    </div>
    <theme-control></theme-control>
    <div class="aui-i-subtitle">
      <strong>{{ project.name }}</strong>
    </div>
    <div class="aui-i-profile">
      <profile></profile>
    </div>
  </div>
</template>
<script>
import Logo from '@/components/frame/block/logo';
import Profile from '@/components/frame/block/profile';
import ThemeControl from '@/components/frame/block/theme_control';
import {events, EventBus} from '@/service/event_bus'

export default {
  props: ['project'],
  data: function () {
    return {
      menuTheme: localStorage.getItem('theme') || 'light',
      activeName: this.getDefaultActiveName()
    }
  },
  created() {
    EventBus.on(events.THEME_CHANGED, newTheme => {
      this.menuTheme = newTheme;
    })
  },
  components: {
    Logo,
    Profile,
    ThemeControl
  },
  methods: {
    getDefaultActiveName() {
      let defaultName = 'kanban';
      let path = this.$route.path;
      let splits = path.split('/');
      let l = splits.length;
      if (splits[l - 3] === 'project') {
        defaultName = splits[l - 1];
      }
      return defaultName;
    },
    onMenuChanged(name) {
      if (name !== this.activeName) {
        this.activeName = name;
        this.$router.push({
          name: name,
          params: {
            projectId: this.project.id
          }
        });
      }
    }
  }
}
</script>

<style lang="less" scoped>
.aui-header {
  .aui-i-subtitle {
    font-size: 16px;
  }
}
</style>
