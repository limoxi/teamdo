import LaneService from "@/business/lane_service";

class Lane {
    constructor(project, data, posi = 1) {
        this.projectId = project.id
        this.id = data?.id ?? 0
        this.name = data?.name ?? ''
        this.wip = data?.wip ?? 8
        this.isEnd = data?.is_end ?? false

        this.isFirst = false
        this.isLast = false
        switch (posi) {
            case 0:
                this.isFirst = true
                break
            case -1:
                this.isLast = true
        }

        this.tasks = []
        this.loadingTasks = false
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
