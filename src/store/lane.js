import {ref} from 'vue'
import {defineStore} from 'pinia'
import LaneService from "@/service/lane_service"
import TaskService from "@/service/task_service"
import {Message} from "view-ui-plus";
import lane from "./lane";

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
    LaneService.getTasks(this.projectId, this.id, filters).then(resp => {
      this.tasks = resp.tasks
      this.loadingTasks = false
    }).catch(err => {
      Message.error(err.errMsg);
    })
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

  function addTask(projectId, taskData) {
    return TaskService.addTask(projectId, taskData).then((data) => {
      getLane(data.lane_id).value.loadTasks()
    }).catch(err => {
      Message.error(err.errMsg);
    });
  }

  function updateTask(projectId, laneId, taskData) {
    return TaskService.updateTask(projectId, taskData).then(() => {
      getLane(laneId).value.loadTasks()
    }).catch(err => {
      Message.error(err.errMsg);
    });
  }

  function deleteTask(projectId, laneId, taskId) {
    return TaskService.deleteTask(projectId, taskId).then(() => {
      getLane(laneId).value.loadTasks()
    }).catch(err => {
      Message.error(err.errMsg);
    });
  }

  function refresh(laneIds = undefined) {
    const lids = laneIds ?? Object.keys(id2lane)
    for (const lid of lids) {
      id2lane[lid].value.loadTasks()
    }
  }

  function shuttleTask(toLaneId, task, beforeTaskId = 0) {
    const refreshingLaneIds = new Set()
    refreshingLaneIds.add(targetLaneId)
    refreshingLaneIds.add(task.lane_id)
    LaneService.shuttleTask(this.projectId, task.id, targetLaneId, beforeTaskId).then(() => {
      refresh(Array.from(refreshingLaneIds))
    }).catch(err => {
      Message.error(err.errMsg)
    })
  }

  function shuttleTasks(projectId, targetLaneId, tasks) {
    const refreshingLaneIds = new Set()
    const taskIds = new Set()
    for (const task of tasks) {
      refreshingLaneIds.add(task.lane_id)
      taskIds.add(task.id)
    }
    refreshingLaneIds.add(targetLaneId)
    return LaneService.shuttleTasks(projectId, targetLaneId, Array.from(taskIds)).then(() => {
      refresh(Array.from(refreshingLaneIds))
    }).catch(err => {
      Message.error(err.errMsg || '批量操作失败');
    });
  }

  return {initLane, getLane, refresh, addTask, updateTask, deleteTask, shuttleTask, shuttleTasks}
})

export default useLaneStore
