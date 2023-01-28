<template>
  <div :class="themeClass">
    <router-view></router-view>
  </div>
</template>
<script setup>
import {useConfigStore} from '@/store'
import {storeToRefs} from "pinia";
import {computed} from "vue";

const configStore = useConfigStore()
const {theme} = storeToRefs(configStore)
const themeClass = computed(() => `aui-theme-${theme.value}`)

</script>
<style lang="less">
@import 'assets/styles/common.less';
</style>
