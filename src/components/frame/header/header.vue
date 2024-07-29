<template>
  <div class="aui-header">
    <Logo/>
    <div class="aui-i-menu">
      <Menu mode="horizontal" :theme="theme" :active-name="activeName" @on-select="onMenuChanged">
        <MenuItem name="projects">项目</MenuItem>
        <MenuItem name="tasks">任务</MenuItem>
        <MenuItem name="works">工单</MenuItem>
        <MenuItem v-if="userStore?.hasPerm('系统管理员')" name="users">用户</MenuItem>
        <MenuItem v-if="userStore?.hasPerm('系统管理员')" name="sys_settings">设置</MenuItem>
      </Menu>
    </div>
    <Icon type="ios-megaphone" class="aui-release-btn" @click="releaseRef?.show"/>
    <ThemeControl/>
    <div class="aui-i-action">
      <profile></profile>
    </div>
  </div>
  <ReleaseViewModal ref="releaseRef"/>
</template>
<script setup>
import Logo from '@/components/frame/block/logo'
import ReleaseViewModal from '@/components/modal/release_view_modal'
import Profile from '@/components/frame/block/profile'
import ThemeControl from '@/components/frame/block/theme_control'
import {useConfigStore, useUserStore} from '@/store'
import {storeToRefs} from 'pinia'
import {onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import {Icon, MenuItem, Message} from 'view-ui-plus'

const releaseRef = ref(null)
const userStore = useUserStore()
const configStore = useConfigStore()
const {theme} = storeToRefs(configStore)
let activeName = ref('projects')

const router = useRouter()

onMounted(() => {
  activeName.value = router.currentRoute.value.name
})

const onMenuChanged = (name) => {
  if (name !== activeName.value) {
    activeName.value = name
    switch (name) {
      case 'works':
        Message.info('尽请期待！')
        return
    }
    router.push({
      name: name
    })
  }
}

</script>

<style lang="less" scoped>
.aui-header {
  .aui-release-btn {
    font-size: 18px;
    cursor: pointer;

    &:hover {
      transform: scale(1.1);
    }
  }
}
</style>
