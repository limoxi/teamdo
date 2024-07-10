import LaneService from '@/business/lane_service'
import Lane from './lane'
import {Message} from 'view-ui-plus'

class Kanban {
    constructor(project, kanbanData = undefined) {
        this.id = kanbanData?.id ?? 0
        this.name = kanbanData?.name ?? ''

        this.lanes = (kanbanData?.lanes ?? []).map(lane => new Lane(project, this, lane))
        this.project = project
    }

    getLaneById(laneId) {
        let lanes = this.lanes.filter(lane => lane.id === laneId)
        if (lanes.length > 0) return lanes[0]

        return null
    }

    addLane(name, afterLaneId) {
        return LaneService.addLane(this.project.id, this.id, name, afterLaneId).then((laneData) => {
            const afterIndex = this.lanes.findIndex(lane => lane.id === afterLaneId)
            const newLane = new Lane(this.project, this, laneData)
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
        return LaneService.updateLane(this.project.id, data).then((laneData) => {
            const newLane = new Lane(this, laneData)
            const oldLane = this.getLaneById(newLane.id)
            newLane.tasks = oldLane.tasks
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

    refreshLanes(laneIds = undefined) {
        const lids = laneIds ?? Object.keys(this.lanes.map(l => l.id))
        for (const lid of lids) {
            this.getLaneById(lid).refresh()
        }
    }

}

export default Kanban