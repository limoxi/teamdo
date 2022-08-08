import {ref} from 'vue'
import {defineStore} from 'pinia'
import helper from '@/utils/helper'

const useTaskModeStore = defineStore('task_mode',() => {

  let mode = ref('NORMAL')
  let selectedTasks = ref([])

  function changeMode() {
    if (mode.value === 'NORMAL') {
      mode.value = 'SELECT'
    } else {
      mode.value = 'NORMAL'
    }
    selectedTasks.value = []
  }

  function toggleTask(task, selected) {
    const exist = selectedTasks.value.includes(task)
    if (selected) {
      if(exist) return
      selectedTasks.value.push(task)
    } else {
      if (!exist) return
      helper.removeFromArray(task, selectedTasks.value, 'id')
    }
  }

  return {
    mode,
    selectedTasks,
    changeMode,
    toggleTask
  }
})

export default useTaskModeStore
