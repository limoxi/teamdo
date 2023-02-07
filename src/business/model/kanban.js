import {Message} from "view-ui-plus";
import LaneService from "../lane_service"

class Kanban {
    constructor(project, lanes) {
        this.project = project
        this.lanes = lanes
    }

    refreshLanes(laneIds = undefined) {
        const lids = laneIds ?? Object.keys(this.project.lanes.map(l => l.id))
        for (const lid of lids) {
            this.project.getLane(lid).refresh()
        }
    }

    shuttleTask(sourceLaneId, targetLaneId, taskId, beforeTaskId = 0) {
        LaneService.shuttleTask(this.project.id, taskId, targetLaneId, beforeTaskId).then(() => {
            const targetLane = this.project.getLane(targetLaneId)
            const refresh = sourceLaneId !== targetLaneId
            if (refresh) {
                const fromLane = this.project.getLane(sourceLaneId)
                const shuttledTask = fromLane.getTask(taskId)
                fromLane.removeTaskLocally(taskId)

                const targetLane = this.project.getLane(targetLaneId)
                targetLane.addTaskLocally(shuttledTask)
            } else {  // ！此处注意
                targetLane.getTask(taskId).lane_id = targetLaneId
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
            refreshingLaneIds.add(task.lane_id)
            taskIds.add(task.id)
        }
        refreshingLaneIds.add(targetLaneId)
        return LaneService.shuttleTasks(this.project.id, targetLaneId, Array.from(taskIds)).then(() => {
            this.refreshLanes(Array.from(refreshingLaneIds))
        }).catch(err => {
            Message.error(err.errMsg || '批量操作失败');
        })
    }

}

export default Kanban
