import Resource from '@/utils/resource';

class LaneService {

  static getIntType(type) {
    return {
      'kanban': 0,
      'sprint': 1
    }[type]
  }

  static getLanes(projectId) {
    return Resource.get({
      'resource': 'project.lanes',
      'data': {
        'project_id': projectId
      }
    });
  }

  static addLane(projectId, newLaneName, afterLaneId) {
    return Resource.put({
      'resource': 'project.lane',
      'data': {
        'project_id': projectId,
        'name': newLaneName,
        'after_lane_id': afterLaneId
      }
    });
  }

  static updateLane(projectId, newLane) {
    return Resource.post({
      'resource': 'project.lane',
      'data': {
        'project_id': projectId,
        'id': newLane.id,
        'name': newLane.name,
        'wip': newLane.wip,
        'is_end': newLane.isEnd
      }
    });
  }

  static deleteLane(projectId, lane) {
    return Resource.delete({
      'resource': 'project.lane',
      'data': {
        'id': lane.id,
        'project_id': projectId
      }
    });
  }

  static resort(projectId, laneIds) {
    return Resource.put({
      'resource': 'project.resorted_lanes',
      'data': {
        'project_id': parseInt(projectId),
        'ids': laneIds.map(lane => {
          return parseInt(lane.id);
        })
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

  static getTasks(projectId, laneId, filters = {}, curPage = 1, pageSize = 50) {
    return Resource.get({
      'resource': 'project.lane.tasks',
      'data': {
        'project_id': projectId,
        'lane_id': laneId,
        'with_options': {
          'with_users': true,
          'with_tags': true
        },
        'filters': filters,
        'cur_page': curPage,
        'page_size': pageSize
      }
    })
  }

}

export default LaneService;
