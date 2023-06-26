import ProjectService from "@/business/project_service"
import TagService from "@/business/tag_service"
import {Message} from "view-ui-plus"
import LaneService from "@/business/lane_service"
import TaskService from "@/business/task_service"
import Lane from './lane'

class Project {
    constructor(projectData = undefined) {
        this.id = projectData?.id ?? 0
        this.name = projectData?.name ?? ''
        this.prefix = projectData?.prefix ?? 'XXX'
        this.users = projectData?.users ?? []
        this.tags = projectData?.tags ?? []
        this.bots = projectData?.bots ?? []
        this.lanes = []
        if (projectData?.lanes) {
            projectData.lanes.forEach((laneData, index) => {
                let posi = 1
                if (index === 0) {
                    posi = 0
                } else if (index === projectData.lanes.length - 1) {
                    posi = -1
                }
                this.lanes.push(new Lane(this, laneData, posi))
            })
        }

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

    getLane(laneId) {
        const lanes = this.lanes.filter(lane => lane.id === laneId)
        if (lanes.length === 0) return null
        return lanes[0]
    }

    getFirstLane() {
        return this.lanes[0]
    }

    addLane(name, afterLaneId) {
        return LaneService.addLane(this.id, name, afterLaneId).then((laneData) => {
            const afterIndex = this.lanes.findIndex(lane => lane.id === afterLaneId)
            const newLane = new Lane(this, laneData)
            if (afterIndex < 0) {
                this.lanes.push(newLane)
            } else {
                this.lanes.splice(afterIndex + 1, 0, newLane)
            }
        }).catch(err => {
            Message.error(err.errMsg)
        })
    }

    updateLane(data) {
        return LaneService.updateLane(this.id, data).then((laneData) => {
            const newLane = new Lane(this, laneData)
            newLane.tasks = this.getLane(newLane.id).tasks
            const elIndex = this.lanes.findIndex(lane => lane.id === newLane.id)
            if (elIndex >= 0) {
                this.lanes[elIndex] = newLane
            }
        }).catch(err => {
            Message.error(err.errMsg)
        });
    }

    deleteLane(laneId) {
        return LaneService.deleteLane(this.id, laneId).then(() => {
            const elIndex = this.lanes.findIndex(lane => lane.id === laneId)
            if (elIndex >= 0) {
                this.lanes.splice(elIndex, 1)
            }
        }).catch(err => {
            Message.error(err.errMsg)
        });
    }

    // 获取泳道从开始到结算的距离
    getLifeTimeOfLanes() {
        let count = 0
        for (const lane of this.lanes) {
            count += 1
            if (lane.isEnd) {
                break
            }
        }
        return count
    }

    refreshLanes(laneIds = undefined) {
        const lids = laneIds ?? Object.keys(this.lanes.map(l => l.id))
        for (const lid of lids) {
            this.getLane(lid).refresh()
        }
    }

    shuttleTask(sourceLaneId, targetLaneId, task, beforeTaskId = 0, refresh = false) {
        LaneService.shuttleTask(this.id, task.id, targetLaneId, beforeTaskId).then(() => {
            if (refresh && sourceLaneId !== targetLaneId) {
                this.getLane(sourceLaneId).removeTask(task)
                this.getLane(targetLaneId).addTask(task)
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
        refreshingLaneIds.add(targetLaneId)
        return LaneService.shuttleTasks(this.id, targetLaneId, Array.from(taskIds)).then(() => {
            this.refreshLanes(Array.from(refreshingLaneIds))
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

    setTaskAssignor(laneId, taskId, assignorId) {
        return TaskService.setAssignorForTask(this.id, taskId, assignorId).then(() => {
            this.getLane(laneId).tasks.forEach(task => {
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
            this.getLane(laneId).tasks.forEach(task => {
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
