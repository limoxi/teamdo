import {ref} from 'vue'
import {defineStore} from 'pinia'
import LaneService from "@/service/lane_service"
import TaskService from "@/service/task_service"

class Lane {
  constructor(projectId, data) {
    this.projectId = projectId
    this.id = data?.id ?? 0
    this.name = data?.name ?? ''
    this.wip = data?.wip ?? 8
    this.isEnd = data?.is_end ?? false
    this.tasks = []
    this.loadingTasks = false
  }

  loadTasks(filters = null) {
    this.loadingTasks = true
    return LaneService.getTasks(this.projectId, this.id, filters).then(resp => {
      this.tasks = resp.tasks
      this.loadingTasks = false
    })
  }

  shuttleTask(task, beforeTaskId = 0) {
    return LaneService.shuttleTask(this.projectId, task.id, this.id, beforeTaskId)
  }

  setTaskAssignor(task, assignorId) {
    return TaskService.setAssignorForTask(this.projectId, task.id, assignorId).then(() => {
      this.loadTasks()
    })
  }

}

const useLaneStore = defineStore('lane', () => {
  const id2lane = {}

  function initLane(projectId, laneData) {
    const newLane = ref(new Lane(projectId, laneData))
    id2lane[laneData.id] = newLane
    return newLane
  }

  function getLane(laneId) {
    return id2lane[laneId]
  }

  function refresh() {
    for (const lid of Object.keys(id2lane)) {
      id2lane[lid].value.loadTasks()
    }
  }

  return {initLane, getLane, refresh}
})

export default useLaneStore
