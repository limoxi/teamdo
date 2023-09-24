import LaneService from "@/business/lane_service";
import {KANBAN_TYPE_EPIC, KANBAN_TYPE_KANBAN, KANBAN_TYPE_WORK} from "./constant";

class Lane {
    constructor(project, data) {
        this.projectId = project.id
        this.id = data?.id ?? 0
        this.name = data?.name ?? ''
        this.wip = data?.wip ?? 8
        this.isEnd = data?.is_end ?? false
        this.kanbanType = data?.kanban_type ?? KANBAN_TYPE_KANBAN
        this.managerIds = data?.manager_ids ?? []

        this.isFirst = false
        this.isLast = false

        this.tasks = []
        this.loadingTasks = false
    }

    setFirst() {
        this.isFirst = true
    }

    setLast() {
        this.isLast = true
    }

    isKanbanLane() {
        return this.kanbanType === KANBAN_TYPE_KANBAN
    }

    isEpicLane() {
        return this.kanbanType === KANBAN_TYPE_EPIC
    }

    isWorkLane() {
        return this.kanbanType === KANBAN_TYPE_WORK
    }

    setManagers(managerIds) {
        LaneService.setManagers(this.projectId, this.id, managerIds).then(() => {
            this.managerIds = managerIds
        }).catch(e => {
            console.error(e)
        })
    }

    refresh() {
        this.loadTasks()
    }

    loadTasks(filters = {}) {
        this.loadingTasks = true
        LaneService.getTasks(this.projectId, this.id, filters).then(respData => {
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
