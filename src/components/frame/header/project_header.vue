<template>
  <div class="aui-header">
    <logo></logo>
    <div class="aui-i-menu">
      <Menu mode="horizontal" :theme="menuTheme" :active-name="activeName" @on-select="onMenuChanged">
        <MenuItem name="projects">项目</MenuItem>
        <MenuItem name="kanban">看板</MenuItem>
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
<script setup>
import Logo from '@/components/frame/block/logo';
import Profile from '@/components/frame/block/profile';
import ThemeControl from '@/components/frame/block/theme_control';
import {events} from '@/service/event_bus'
import {ref, inject, onMounted} from "vue";
import {useRouter} from 'vue-router'
const router = useRouter()

const EventBus = inject('eventBus')
const props = defineProps(['project'])
let menuTheme = ref('light')
let activeName = ref('kanban')

onMounted(() => {
  menuTheme.value = localStorage.getItem('theme') || 'light'
  activeName.value = getDefaultActiveName()

  EventBus.on(events.THEME_CHANGED, newTheme => {
    menuTheme.value = newTheme;
  }, 'project_header')
})

const getDefaultActiveName = () => {
  let defaultName = 'kanban';
  let path = router.currentRoute.value.path;
  let splits = path.split('/');
  let l = splits.length;
  if (splits[l - 3] === 'project') {
    defaultName = splits[l - 1];
  }
  return defaultName;
}
const onMenuChanged = (name) => {
  if (name !== activeName.value) {
    activeName.value = name;
    router.push({
      name: name,
      params: {
        projectId: props.project.id
      }
    });
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
