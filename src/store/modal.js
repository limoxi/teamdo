import {ref} from 'vue'
import {defineStore} from 'pinia'
import modal from "view-ui-plus/src/components/modal";

export const useModalStore = defineStore('modal', () => {

  let projectId = ref(0)
  let userSelectModal = ref({
    show: false,
    taskId: 0,
    userSelected: false,
    selectedUserId: null,
  })

  let projectModal = ref({
    show: false,
    project: null
  })

  const show = (modalName, data=undefined) => {
    switch(modalName) {
      case 'userSelectModal':
        projectId.value = data?.projectId || 0
        userSelectModal.value.taskId = data?.taskId || 0
        userSelectModal.value.userSelected = false
        userSelectModal.value.selectedUserId = null
        userSelectModal.value.show = true
        break
      case 'projectModal':
        projectId.value = data?.project?.id || 0
        projectModal.value.project = data?.project || null
        projectModal.value.show = true
    }
  }

  return {
    projectId,
    userSelectModal,
    projectModal,
    show
  }
})
