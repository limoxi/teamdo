import {ref} from 'vue'
import {defineStore} from 'pinia'
import modal from "view-ui-plus/src/components/modal";

const useModalStore = defineStore('modal', () => {

  let projectId = ref(0)
  const userSelectModal = ref({
    show: false,
    taskId: 0,
    userSelected: false,
    selectedUserId: null,
  })

  const projectModal = ref({
    show: false,
    project: null
  })

  const botModal = ref({
    show: false,
    bot: null
  })

  const laneModal = ref({
    show: false,
    lane: null,
    mode: 'create'
  })

  const taskModal = ref({
    show: false,
    task: null
  })

  const taskLogModal = ref({
    show: false,
    task: null
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
      case 'taskModal':
        projectId.value = data.projectId || 0
        taskModal.value.task = data.task || null
        taskModal.value.show = true
        break
      case 'taskLogModal':
        projectId.value = data.projectId || 0
        taskLogModal.value.task = data.task || null
        taskLogModal.value.show = true
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
      case 'taskModal':
        taskModal.value.show = false
        break
      case 'taskLogModal':
        taskLogModal.value.show = false
        break
    }
  }

  return {
    projectId,
    userSelectModal,
    projectModal,
    botModal,
    laneModal,
    taskModal,
    taskLogModal,
    show,
    close
  }
})

export default useModalStore
