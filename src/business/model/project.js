import ProjectService from "@/business/project_service"
import TagService from "@/business/tag_service"
import {Message} from "view-ui-plus"
import LaneService from "@/business/lane_service"
import Lane from './lane'
import Kanban from "./kanban";

class Project {
    constructor(projectData = undefined) {
        this.id = projectData?.id ?? 0
        this.name = projectData?.name ?? ''
        this.prefix = projectData?.prefix ?? 'XXX'
        this.users = projectData?.users ?? []
        this.tags = projectData?.tags ?? []
        this.bots = projectData?.bots ?? []
        this.lanes = []
        this.id2lane = {}
        if (projectData?.lanes) {
            projectData.lanes.forEach((laneData, index) => {
                let posi = 1
                if (index === 0) {
                    posi = 0
                } else if (index === projectData.lanes.length - 1) {
                    posi = -1
                }
                const l = new Lane(this, laneData, posi)
                this.id2lane[l.id] = l
                this.lanes.push(l)
            })
        }

        this.Kanban = new Kanban(this, this.lanes)
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
        return this.id2lane[laneId]
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
            this.id2lane[newLane.id] = newLane
        }).catch(err => {
            Message.error(err.errMsg)
        })
    }

    updateLane(data) {
        return LaneService.updateLane(this.id, data).then((laneData) => {
            const newLane = new Lane(this, laneData)
            const elIndex = this.lanes.findIndex(lane => lane.id === newLane.id)
            if (elIndex >= 0) {
                this.lanes[elIndex] = newLane
                this.id2lane[newLane.id] = newLane
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
                delete (this.id2lane, laneId)
            }
        }).catch(err => {
            Message.error(err.errMsg)
        });
    }
}

export default Project
