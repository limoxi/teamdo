<template>
  <div @click="onToggleTheme" :class="curTheme">
    {{ desc }}
    <Icon :type="btnType"/>
  </div>
</template>

<script setup>
import {events} from '@/service/event_bus'
import {ref, computed, inject, onMounted} from "vue";

const EventBus = inject('eventBus')
let curTheme = ref('light')

onMounted(() => {
  curTheme.value = window.localStorage.getItem('theme') || 'light'
})

const btnType = computed(() => curTheme.value === 'light' ? 'md-moon' : 'md-sunny')
const desc = computed(() => curTheme.value === 'light' ? '关灯' : '开灯')

const onToggleTheme = () => {
  if (curTheme.value === 'light') {
    curTheme.value = 'dark'
  } else {
    curTheme.value = 'light'
  }
  window.localStorage.setItem('theme', curTheme.value);
  EventBus.emit(events.THEME_CHANGED, curTheme.value);
}

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
