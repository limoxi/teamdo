import ProjectService from "@/business/project_service"
import TagService from "@/business/tag_service"
import {Message} from "view-ui-plus"
import LaneService from "@/business/lane_service"
import TaskService from "@/business/task_service"
import Lane from './lane'
import {KANBAN_TYPE_EPIC, KANBAN_TYPE_KANBAN, KANBAN_TYPE_WORK} from "./constant";
import EpicTaskService from '@/business/epic_task_service'

class Project {
    constructor(projectData = undefined) {
        this.id = projectData?.id ?? 0
        this.name = projectData?.name ?? ''
        this.prefix = projectData?.prefix ?? 'XXX'
        this.users = projectData?.users ?? []
        this.tags = projectData?.tags ?? []
        this.bots = projectData?.bots ?? []
        this.kanbanLanes = []
        this.epicLanes = []
        this.workLanes = []
        this.needReloadEpics = false

        this.initLanes(projectData?.lanes || [])
    }

    initLanes(lanes) {
        if (lanes.length === 0) {
            return
        }
        lanes.forEach((laneData, _) => {
            const lane = new Lane(this, laneData)
            switch (laneData.kanban_type) {
                case 'kanban':
                    this.kanbanLanes.push(lane)
                    break
                case 'epic':
                    this.epicLanes.push(lane)
                    break
                case 'work':
                    this.workLanes.push(lane)
                    break
            }
        })
        const kll = this.kanbanLanes.length
        if (kll > 0) {
            this.kanbanLanes[0].setFirst()
            if (kll > 1) {
                this.kanbanLanes[kll - 1].setLast()
            }
        }
        const ell = this.epicLanes.length
        if (ell > 0) {
            this.epicLanes[0].setFirst()
            if (ell > 1) {
                this.epicLanes[ell - 1].setLast()
            }
        }
        const wll = this.workLanes.length
        if (wll > 0) {
            this.workLanes[0].setFirst()
            if (wll > 1) {
                this.workLanes[wll - 1].setLast()
            }
        }
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

    getLaneById(laneId) {
        let lanes = this.kanbanLanes.filter(lane => lane.id === laneId)
        if (lanes.length > 0) return lanes[0]

        lanes = this.epicLanes.filter(lane => lane.id === laneId)
        if (lanes.length > 0) return lanes[0]

        lanes = this.workLanes.filter(lane => lane.id === laneId)
        if (lanes.length > 0) return lanes[0]

        return null
    }

    getLane(laneId, kanbanType) {
        let lanes = this.getLanesByKanbanType(kanbanType)
        lanes = lanes.filter(lane => lane.id === laneId)
        if (lanes.length === 0) return null
        return lanes[0]
    }

    getLanesByKanbanType(kanbanType) {
        switch (kanbanType) {
            case KANBAN_TYPE_KANBAN:
                return this.kanbanLanes
            case KANBAN_TYPE_EPIC:
                return this.epicLanes
            case KANBAN_TYPE_WORK:
                return this.workLanes
        }
        return []
    }

    addLane(name, kanbanType, afterLaneId) {
        return LaneService.addLane(this.id, name, kanbanType, afterLaneId).then((laneData) => {
            const lanes = this.getLanesByKanbanType(kanbanType)
            const afterIndex = lanes.findIndex(lane => lane.id === afterLaneId)
            const newLane = new Lane(this, laneData)
            if (afterIndex < 0) {
                lanes.push(newLane)
            } else {
                lanes.splice(afterIndex + 1, 0, newLane)
            }
        }).catch(err => {
            Message.error(err.errMsg)
        })
    }

    updateLane(data) {
        return LaneService.updateLane(this.id, data).then((laneData) => {
            const newLane = new Lane(this, laneData)
            const oldLane = this.getLane(newLane.id, newLane.kanbanType)
            newLane.tasks = oldLane.tasks
            const lanes = this.getLanesByKanbanType(newLane.kanbanType)
            const elIndex = lanes.findIndex(lane => lane.id === newLane.id)
            if (elIndex >= 0) {
                lanes[elIndex] = newLane
            }
        }).catch(err => {
            Message.error(err.errMsg)
        });
    }

    deleteLane(laneId) {
        const lane = this.getLaneById(laneId)
        return LaneService.deleteLane(this.id, laneId).then(() => {
            const lanes = this.getLanesByKanbanType(lane.kanbanType)
            const elIndex = lanes.findIndex(lane => lane.id === laneId)
            if (elIndex >= 0) {
                lanes.splice(elIndex, 1)
            }
        }).catch(err => {
            Message.error(err.errMsg)
        });
    }

    refreshLanes(kanbanType, laneIds = undefined) {
        const lanes = this.getLanesByKanbanType(kanbanType)
        const lids = laneIds ?? Object.keys(lanes.map(l => l.id))
        for (const lid of lids) {
            this.getLane(lid, kanbanType).refresh()
        }
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
        const targetLane = this.getLaneById()
        refreshingLaneIds.add(targetLaneId)
        return LaneService.shuttleTasks(this.id, targetLaneId, Array.from(taskIds)).then(() => {
            this.refreshLanes(Array.from(refreshingLaneIds), targetLane.kanbanType)
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
