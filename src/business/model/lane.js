import LaneService from "@/business/lane_service"
import TaskService from "@/business/task_service"
import {Message} from "view-ui-plus";

class Lane {
    constructor(project, data, posi = 1) {
        this.projectId = project.id
        this.id = data?.id ?? 0
        this.name = data?.name ?? ''
        this.wip = data?.wip ?? 8
        this.isEnd = data?.is_end ?? false
        this.tasks = []
        this.loadingTasks = false

        this.project = project
        this.isFirst = false
        this.isLast = false
        switch (posi) {
            case 0:
                this.isFirst = true
                break
            case -1:
                this.isLast = true
        }
    }

    loadTasks(filters = null) {
        this.loadingTasks = true
        LaneService.getTasks(this.projectId, this.id, filters).then(resp => {
            this.tasks = resp.tasks
            this.loadingTasks = false
        }).catch(err => {
            console.error(err)
            Message.error(err.errMsg);
        })
    }

    setTaskAssignor(task, assignorId) {
        TaskService.setAssignorForTask(this.projectId, task.id, assignorId).then(() => {
            const laneTask = this.getTask(task.id)
            laneTask.assignorId = assignorId
        }).catch(e => {
            Message.error(e.errMsg || '设置执行人失败')
        })
    }

    switchTaskFlashing(taskId) {
        const laneTask = this.getTask(taskId)
        const isFLashing = laneTask.flashing
        return TaskService.switchTaskFlashing(this.projectId, taskId, !isFLashing).then(() => {
            laneTask.flashing = !isFLashing
        }).catch(err => {
            Message.error(err.errMsg);
        });
    }

    removeTaskLocally(taskId) {
        const elIndex = this.tasks.findIndex(task => {
            return task.id === taskId
        })
        if (elIndex >= 0) {
            this.tasks.splice(elIndex, 1)
        }
    }

    addTaskLocally(task) {
        task.lane_id = this.id
        this.tasks.splice(0, 0, task)
    }

    updateTaskLocally(updatedTask) {
        const elIndex = this.tasks.findIndex(task => {
            console.warn(task.id)
            return task.id === updatedTask.id
        })
        console.log(updatedTask.id)
        if (elIndex >= 0) {
            this.tasks[elIndex] = updatedTask
        }
    }

    getTask(taskId) {
        return this.tasks.filter(task => {
            return task.id === taskId
        })[0]
    }

    addTask(taskData) {
        return TaskService.addTask(this.projectId, taskData).then(newTask => {
            this.addTaskLocally(newTask)
        }).catch(err => {
            Message.error(err.errMsg);
        });
    }

    updateTask(taskData) {
        return TaskService.updateTask(this.projectId, taskData).then(updatedTask => {
            this.updateTaskLocally(updatedTask)
        }).catch(err => {
            Message.error(err.errMsg);
        });
    }

    deleteTask(taskId) {
        return TaskService.deleteTask(this.projectId, taskId).then(() => {
            this.removeTaskLocally(taskId)
        }).catch(err => {
            Message.error(err.errMsg);
        });
    }

    refresh() {
        this.loadTasks()
    }
}

export default Lane
