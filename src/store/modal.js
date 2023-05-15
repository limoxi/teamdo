import {ref} from 'vue'
import {defineStore} from 'pinia'

const useModalStore = defineStore('modal', () => {

    let projectId = ref(0)

    const projectSelectModal = ref({
        show: false,
        projectSelected: false,
        selectedProjectId: null,
        action: ''
    })

    const userSelectModal = ref({
        show: false,
        laneId: 0,
        taskId: 0,
        userSelected: false,
        selectedUserId: null,
        action: ''
    })

    const usersSelectModal = ref({
        show: false,
        laneId: 0,
        taskId: 0,
        userSelected: false,
        selectedUserIds: [],
        action: ''
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
        readonly: false,
        task: null,
        relatedTask: null,
        updatedTask: null
    })

    const epicModal = ref({
        show: false,
        readonly: false,
        task: null,
        beforeTaskId: 0
    })

    const taskLogModal = ref({
        show: false,
        task: null
    })

    const show = (modalName, data = undefined) => {
        switch (modalName) {
            case 'projectSelectModal':
                projectSelectModal.value.projectSelected = false
                projectSelectModal.value.selectedProjectId = null
                projectSelectModal.value.action = data?.action || ''
                projectSelectModal.value.show = true
                break
            case 'userSelectModal':
                projectId.value = data?.projectId || 0
                userSelectModal.value.taskId = data?.taskId || 0
                userSelectModal.value.laneId = data?.laneId || 0
                userSelectModal.value.userSelected = false
                userSelectModal.value.selectedUserId = null
                userSelectModal.value.action = data?.action || ''
                userSelectModal.value.show = true
                break
            case 'usersSelectModal':
                projectId.value = data?.projectId || 0
                usersSelectModal.value.taskId = data?.taskId || 0
                usersSelectModal.value.laneId = data?.laneId || 0
                usersSelectModal.value.userSelected = false
                usersSelectModal.value.selectedUserIds = []
                usersSelectModal.value.action = data?.action || ''
                usersSelectModal.value.show = true
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
                taskModal.value.relatedTask = data.relatedTask || null
                taskModal.value.show = true
                taskModal.value.readonly = data.readonly || false
                break
            case 'epicModal':
                projectId.value = data.projectId || 0
                epicModal.value.beforeTaskId = data.beforeTaskId || 0
                epicModal.value.task = data.task || null
                epicModal.value.show = true
                epicModal.value.readonly = data.readonly || false
                console.log(epicModal.value)
                break
            case 'taskLogModal':
                projectId.value = data.projectId || 0
                taskLogModal.value.task = data.task || null
                taskLogModal.value.show = true
                break
        }
    }

    const close = (modalName) => {
        switch (modalName) {
            case 'projectSelectModal':
                projectSelectModal.value.show = false
                break
            case 'userSelectModal':
                userSelectModal.value.show = false
                break
            case 'usersSelectModal':
                usersSelectModal.value.show = false
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
            case 'epicModal':
                epicModal.value.show = false
                break
            case 'taskLogModal':
                taskLogModal.value.show = false
                break
        }
    }

    return {
        projectId,
        projectSelectModal,
        userSelectModal,
        usersSelectModal,
        projectModal,
        botModal,
        laneModal,
        taskModal,
        epicModal,
        taskLogModal,
        show,
        close
    }
})

export default useModalStore
