import ProjectService from "@/business/project_service"
import TagService from "@/business/tag_service"
import {Message} from "view-ui-plus"
import LaneService from "@/business/lane_service"
import TaskService from "@/business/task_service"
import Lane from './lane'
import EpicTaskService from '@/business/epic_task_service'
import Kanban from './kanban'

class Project {
    constructor(projectData = undefined) {
        this.id = projectData?.id ?? 0
        this.name = projectData?.name ?? ''
        this.prefix = projectData?.prefix ?? 'XXX'
        this.users = projectData?.users ?? []
        this.tags = projectData?.tags ?? []
        this.bots = projectData?.bots ?? []
        this.kanbans = (projectData?.kanbans ?? []).map(kanban => new Kanban(this, kanban))

        this.needReloadEpics = false
    }

    getTagsByBiz(bizCode) {
        const tags = []
        this.tags.forEach(tag => {
            if (tag.biz_code === bizCode) {
                tags.push(tag)
            }
        })
        return tags
    }

    getTagsByKanbanType(kanbanType) {
        let tagBiz = 'normal_task'
        return this.getTagsByBiz(tagBiz)
    }

    reloadTags() {
        if (this.id <= 0) return
        return TagService.getTagsForProject(this.id).then(data => {
            this.tags = data
        })
    }

    getUser(userId) {
        for (const pu of this.users) {
            if (pu.id === userId) {
                return pu
            }
        }
    }

    reloadUsers() {
        if (this.id <= 0) return
        return ProjectService.getProjectMembers(this.id).then(data => {
            this.users = data
        })
    }

    addUser(userId) {
        return ProjectService.addMember(this.id, userId).then(() => {
            this.reloadUsers()
        })
    }

    removeUser(userId) {
        return ProjectService.deleteMember(this.id, userId).then(() => {
            this.reloadUsers()
        })
    }

    getKanbanById(kanbanId) {
        if (this.kanbans.length === 0) {
            return null
        }
        if (kanbanId === 0) {
            return this.kanbans[0]
        }
        for(const kanban of this.kanbans){
            console.log(kanban, '----------')
            if (kanban.id === kanbanId) {
                return kanban
            }
        }
        return null
    }

    shuttleTask(sourceLaneId, targetLaneId, task, beforeTaskId = 0, refresh = false) {
        LaneService.shuttleTask(this.id, task.id, targetLaneId, beforeTaskId).then(() => {
            if (refresh && sourceLaneId !== targetLaneId) {
                this.getLaneById(sourceLaneId).removeTask(task)
                this.getLaneById(targetLaneId).addTask(task)
            }
        }).catch(err => {
            console.error(err)
            Message.error(err.errMsg || '操作失败')
        })
    }

    shuttleTasks(targetLaneId, tasks) {
        const refreshingLaneIds = new Set()
        const taskIds = new Set()
        for (const task of tasks) {
            refreshingLaneIds.add(task.laneId)
            taskIds.add(task.id)
        }
        const targetLane = this.getLaneById(targetLaneId)
        refreshingLaneIds.add(targetLaneId)
        return LaneService.shuttleTasks(this.id, targetLaneId, Array.from(taskIds)).then(() => {
            this.refreshLanes(targetLane.kanbanType, Array.from(refreshingLaneIds))
        }).catch(err => {
            console.error(err)
            Message.error(err.errMsg || '批量操作失败');
        })
    }

    addTask(taskData) {
        return TaskService.addTask(this.id, taskData)
    }

    updateTask(taskData) {
        return TaskService.updateTask(this.id, taskData)
    }

    deleteTask(taskId) {
        return TaskService.deleteTask(this.id, taskId)
    }

    addEpicTask(taskData) {
        return EpicTaskService.addEpicTask(this.id, taskData)
    }

    updateEpicTask(taskData) {
        return EpicTaskService.updateEpicTask(this.id, taskData)
    }

    setTaskAssignor(laneId, taskId, assignorId) {
        return TaskService.setAssignorForTask(this.id, taskId, assignorId).then(() => {
            this.getLaneById(laneId).tasks.forEach(task => {
                if (task.id === taskId) {
                    task.addAssignor(assignorId)
                }
            })
        }).catch(err => {
            console.error(err)
            Message.error(err.errMsg || '设置执行人失败')
        })
    }

    setTaskAssignors(laneId, taskId, assignorIds) {
        return TaskService.setAssignorsForTask(this.id, taskId, assignorIds).then(() => {
            this.getLaneById(laneId).tasks.forEach(task => {
                if (task.id === taskId) {
                    task.setAssignors(assignorIds)
                }
            })
        }).catch(err => {
            console.error(err)
            Message.error(err.errMsg || '设置执行人失败')
        })
    }

    switchTaskFlashing(task) {
        return TaskService.switchTaskFlashing(this.id, task.id, !task.flashing)
    }

    addBot(botId) {
        return ProjectService.addBot(this.id, botId)
    }

    deleteBot(botId) {
        return ProjectService.deleteBot(this.id, botId)
    }

    reloadBots() {
        return ProjectService.getBots(this.id).then(records => {
            this.bots = records
        })
    }
}

export default Project
