import LaneService from "@/business/lane_service";

class Lane {
    constructor(project, kanban, data) {
        this.id = data?.id ?? 0
        this.name = data?.name ?? ''
        this.wip = data?.wip ?? 8
        this.isEnd = data?.is_end ?? false
        this.managerIds = data?.manager_ids ?? []

        this.isFirst = false
        this.isLast = false

        this.tasks = []

        this.project = project
        this.kanban = kanban

        this.isEmpty = data?.isEmpty ?? false
    }

    setFirst() {
        this.isFirst = true
    }

    setLast() {
        this.isLast = true
    }

    setManagers(managerIds) {
        LaneService.setManagers(this.project.id, this.id, managerIds).then(() => {
            this.managerIds = managerIds
        }).catch(e => {
            console.error(e)
        })
    }

    refresh() {
        this.loadTasks()
    }

    loadTasks(filters = {}, orderFields = []) {
        this.loadingTasks = true
        LaneService.getTasks(this.project.id, this.id, filters, orderFields).then(respData => {
            this.tasks = respData.tasks
        }).finally(() => {
            this.loadingTasks = false
        })
    }

    getTaskIndex(taskId) {
        return this.tasks.findIndex(t => t.id === taskId)
    }

    getTask(taskId) {
        const taskIndex = this.getTaskIndex(taskId)
        if (taskIndex < 0){
            return
        }
        return this.tasks[taskIndex]
    }

    addTask(newTask) {
        newTask.laneId = this.id
        this.tasks.splice(0, 0, newTask)
    }

    updateTask(updatedTask) {
        const index = this.getTaskIndex(updatedTask.id)
        if (index === -1) return
        this.tasks.splice(index, 1, updatedTask)
    }

    removeTask(task) {
        const index = this.getTaskIndex(task.id)
        if (index === -1) return
        this.tasks.splice(index, 1)
    }
}

export default Lane
