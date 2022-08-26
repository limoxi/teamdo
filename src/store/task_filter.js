import {ref} from 'vue'
import {defineStore} from 'pinia'

const useTaskFilterStore = defineStore('task_filter', () => {

  let tagId = ref(0)
  let updated = ref(false)

  function updateTagId(newTagId) {
    tagId.value = newTagId
    updated.value = true
  }

  return {
    tagId,
    updated,
    updateTagId
  }
})

export default useTaskFilterStore
