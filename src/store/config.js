import {ref} from 'vue'
import {defineStore} from 'pinia'
import helper from '@/utils/helper'

export const useConfigStore = defineStore('config',() => {
  let theme = ref(helper.storage.get("theme") || 'light')

  const switchTheme = () => {
    if(theme.value === 'light') {
      theme.value = 'dark'
    } else if (theme.value === 'dark') {
      theme.value = 'light'
    }
    helper.storage.set('theme', theme.value)
  }

  return {
    theme,
    switchTheme
  }
})
