<template>
  <div @click="configStore.switchTheme" :class="theme">
    {{desc}}
    <Icon :type="btnType"/>
  </div>
</template>

<script setup>
import {computed} from 'vue'
import {useConfigStore} from '@/store'
import {storeToRefs} from 'pinia'
import {Icon} from 'view-ui-plus'

const configStore = useConfigStore()
const {theme} = storeToRefs(configStore)

const btnType = computed(() => theme.value === 'light' ? 'md-moon' : 'md-sunny')
const desc = computed(() => theme.value === 'light' ? '关灯' : '开灯')

</script>

<style scoped lang="less">
div {
  min-width: 40px;
  cursor: pointer;

  &:hover {
    transform: scale(1.1);
  }
}

.light {
  color: black;
}

.dark {
  color: white;
}

.ivu-icon:before {
  font-size: 12px;
  vertical-align: super;
}
</style>
