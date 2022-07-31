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

  let botModal = ref({
    show: false,
    bot: null
  })

  let laneModal = ref({
    show: false,
    lane: null,
    mode: 'create'
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
        break
      case 'botModal':
        projectId.value = data.projectId || 0
        botModal.value.bot = data.bot || null
        botModal.value.show = true
        break
      case 'laneModal':
        projectId.value = data.projectId || 0
        laneModal.value.lane = data.lane || null
        laneModal.value.mode = data.mode || 'create'
        laneModal.value.show = true
        break
    }
  }

  const close = (modalName) => {
    switch(modalName) {
      case 'userSelectModal':
        userSelectModal.value.show = false
        break
      case 'projectModal':
        projectModal.value.show = false
        break
      case 'botModal':
        botModal.value.show = false
        break
      case 'laneModal':
        laneModal.value.show = false
        break
    }
  }

  return {
    projectId,
    userSelectModal,
    projectModal,
    botModal,
    laneModal,
    show,
    close
  }
})
