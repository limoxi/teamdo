import Resource from '@/utils/resource';
import Task from "./model/task";

class LaneService {

  static getLanes(projectId) {
    return Resource.get({
      'resource': 'project.lanes',
      'data': {
        'project_id': projectId
      }
    });
  }

  static addLane(projectId, newLaneName, kanbanType, roles, afterLaneId) {
    return Resource.put({
      'resource': 'project.lane',
      'data': {
        'project_id': projectId,
        'kanban_type': kanbanType,
        'name': newLaneName,
        'roles': roles,
        'after_lane_id': afterLaneId
      }
    });
  }

  static updateLane(projectId, newLane) {
    const roles = []
    if (newLane.role) {
      roles.push(newLane.role)
    }
    return Resource.post({
      'resource': 'project.lane',
      'data': {
        'project_id': projectId,
        'id': newLane.id,
        'name': newLane.name,
        'wip': newLane.wip,
        'roles': roles,
        'is_end': newLane.isEnd
      }
    });
  }

  static deleteLane(projectId, laneId) {
    return Resource.delete({
      'resource': 'project.lane',
      'data': {
        'project_id': projectId,
        'id': laneId,
      }
    });
  }

  static resort(projectId, lanes) {
    return Resource.put({
      'resource': 'project.resorted_lanes',
      'data': {
        'project_id': parseInt(projectId),
        'ids': lanes.map(lane => {
          return parseInt(lane.id);
        })
      }
    })
  }

  static setManagers(projectId, laneId, managerIds) {
    return Resource.post({
      resource: 'project.lane.managers',
      data: {
        project_id: projectId,
        lane_id: laneId,
        manager_ids: managerIds
      }
    })
  }

  static shuttleTask(projectId, taskId, targetLaneId, beforeTaskId) {
    return Resource.put({
      resource: 'project.shuttled_task',
      data: {
        project_id: projectId,
        task_id: taskId,
        target_lane_id: targetLaneId,
        before_task_id: beforeTaskId
      }
    })
  }

  static shuttleTasks(projectId, targetLaneId, taskIds) {
    return Resource.put({
      'resource': 'project.shuttled_tasks',
      'data': {
        'project_id': projectId,
        'task_ids': taskIds,
        'target_lane_id': targetLaneId
      }
    });
  }

  static async getTasks(projectId, laneId, filters = {}, orderFields = [], curPage = 1, pageSize = 50) {
    const reqData = {
      'project_id': projectId,
      'lane_id': laneId,
      'with_options': {
        'with_users': true,
        'with_tags': true,
        'with_lane_stats': true,
      },
      'filters': filters,
      'cur_page': curPage,
      'page_size': pageSize
    }

    if (orderFields.length > 0) {
      reqData["order_fields"] = orderFields
    }
    const respData = await Resource.get({
      'resource': 'project.lane.tasks',
      'data': reqData
    })
    return {
      tasks: respData.tasks.map(taskData => new Task(taskData)),
      page_info: respData.page_info
    }
  }

}

export default LaneService;
