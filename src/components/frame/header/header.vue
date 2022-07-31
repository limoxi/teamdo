<template>
  <div class="aui-header">
    <logo></logo>
    <div class="aui-i-menu"></div>
    <theme-control></theme-control>
    <div class="aui-i-action">
      <Button icon="md-add" @click="addProject" class="aui-icon-scale">添加项目</Button>
      <profile></profile>
    </div>
  </div>
</template>
<script setup>
import Logo from '@/components/frame/block/logo';
import Profile from '@/components/frame/block/profile';
import ThemeControl from '@/components/frame/block/theme_control';
import {useModalStore} from "@/store"

const modalStore = useModalStore()

const addProject = () => {
  modalStore.show('projectModal')
}

</script>

<style lang="less" scoped>

</style>
