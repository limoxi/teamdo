import {ref} from 'vue'
import {defineStore} from 'pinia'
import helper from '@/utils/helper'

const useConfigStore = defineStore('config', () => {
  let theme = ref(helper.storage.get('theme') || 'light')
  let prioritySight = ref(false)
  let storySight = ref(false)

  const switchTheme = () => {
    if (theme.value === 'light') {
      theme.value = 'dark'
    } else if (theme.value === 'dark') {
      theme.value = 'light'
    }
    helper.storage.set('theme', theme.value)
  }

  const switchKanbanSight = () => {
    prioritySight.value = !prioritySight.value
  }

  const switchStorySight = () => {
    storySight.value = !storySight.value
  }

  return {
    theme,
    prioritySight,
    storySight,
    switchTheme,
    switchKanbanSight,
    switchStorySight
  }
})

export default useConfigStore
