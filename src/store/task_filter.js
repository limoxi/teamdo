import {ref} from 'vue'
import {defineStore} from 'pinia'

const useTaskFilterStore = defineStore('task_filter', () => {

  let tagId = ref(0)
  let assignorId = ref(0)
  let updated = ref(false)

  function updateTagId(newTagId) {
    tagId.value = newTagId
    updated.value = true
  }

  function updateAssignorId(newAssignorId) {
    assignorId.value = newAssignorId
    updated.value = true
  }

  return {
    tagId,
    assignorId,
    updated,
    updateTagId,
    updateAssignorId
  }
})

export default useTaskFilterStore
