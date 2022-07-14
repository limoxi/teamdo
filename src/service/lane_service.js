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

  static addLane(projectId, newLane, afterLaneId) {
    return Resource.put({
      'resource': 'project.lane',
      'data': {
        'project_id': projectId,
        'name': newLane.name,
        'after_lane_id': afterLaneId
      }
    });
  }

  static updateLane(projectId, newLane) {
    return Resource.post({
      'resource': 'project.lane',
      'data': {
        'id': newLane.id,
        'project_id': projectId,
        'name': newLane.name,
        'wip': newLane.wip
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

  static shuttledTask (projectId, taskId, targetLaneId, beforeTaskId) {
    return Resource.put({
      resource: 'project.shuttled_task',
      data: {
        project_id: projectId,
        task_id: taskId,
        target_lane_id: parseInt(targetLaneId),
        before_task_id: beforeTaskId
      }
    })
  }

  static getTasks(projectId, laneId) {
    return Resource.get({
      'resource': 'project.lane.tasks',
      'data': {
        'project_id': projectId,
        'lane_id': laneId,
        'with_options': {
          'with_users': true,
          'with_tags': true
        }
      }
    })
  }

  static sendDingMsg (msg) {
    return Resource.put({
      resource: 'system.ding_msg',
      data: {
        bot_name: 'ufo',
        msg
      }
    })
  }
}

export default LaneService;
