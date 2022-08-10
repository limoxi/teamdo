import {ref} from 'vue'
import {defineStore} from 'pinia'
import LaneService from "@/service/lane_service"
import TaskService from "@/service/task_service"
import {Message} from "view-ui-plus";

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
    TaskService.setAssignorForTask(this.projectId, task.id, assignorId).then(() => {
      const laneTask = this.getTask(task.id)
      laneTask.assignor_id = assignorId
    }).catch(e => {
      Message.error(e.errMsg || '设置执行人失败')
    })
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
      return task.id === updatedTask.id
    })
    if (elIndex >= 0) {
      this.tasks[elIndex] = updatedTask
    }
  }

  getTask(taskId) {
    return this.tasks.filter(task => {
      return task.id === taskId
    })[0]
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
    return TaskService.addTask(projectId, taskData).then((newTask) => {
      getLane(newTask.lane_id).value.addTaskLocally(newTask)
    }).catch(err => {
      Message.error(err.errMsg);
    });
  }

  function updateTask(projectId, laneId, taskData) {
    return TaskService.updateTask(projectId, taskData).then((updatedTask) => {
      getLane(laneId).value.updateTaskLocally(updatedTask)
    }).catch(err => {
      Message.error(err.errMsg);
    });
  }

  function deleteTask(projectId, laneId, taskId) {
    return TaskService.deleteTask(projectId, taskId).then(() => {
      getLane(laneId).value.removeTaskLocally(taskId)
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

  function shuttleTask(projectId, targetLaneId, task, beforeTaskId = 0, refresh=true) {
    LaneService.shuttleTask(projectId, task.id, targetLaneId, beforeTaskId).then(() => {
      const targetLane = getLane(targetLaneId)
      if (refresh) {
        const fromLane = getLane(task.lane_id)
        const shuttledTask = fromLane.value.getTask(task.id)
        fromLane.value.removeTaskLocally(task.id)

        const targetLane = getLane(targetLaneId)
        targetLane.value.addTaskLocally(shuttledTask)
      } else {  // ！此处注意
        targetLane.value.getTask(task.id).lane_id = targetLaneId
      }
    }).catch(err => {
      console.error(err)
      Message.error(err.errMsg || '操作失败1')
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
    })
  }

  return {initLane, getLane, refresh, addTask, updateTask, deleteTask, shuttleTask, shuttleTasks}
})

export default useLaneStore
