import Resource from '@/utils/resource';

class LaneService {

  static getIntType(type) {
    return {
      'kanban': 0,
      'sprint': 1
    }[type]
  }

  static getLanes(projectId, kanbanType) {
    return Resource.get({
      'resource': 'project.lanes',
      'data': {
        'project_id': projectId,
        'kanban_type': this.getIntType(kanbanType)
      }
    });
  }

  static addLane(projectId, kanbanType, newLane) {
    return Resource.put({
      'resource': 'project',
      'data': {
        'project_id': projectId,
        'kanban_type': kanbanType,
        'name': newLane.name,
        'wip': newLane.wip,
        'end_point': newLane.endPoint,
        'valid_roles': JSON.stringify(newLane.validRoles)
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
        'wip': newLane.wip,
        'end_point': newLane.endPoint,
        'valid_roles': JSON.stringify(newLane.validRoles)
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

  static resort(projectId, kanbanType, laneIds) {
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

  static getTasks(projectId, laneId) {
    return Resource.get({
      'resource': 'project.lane.tasks',
      'data': {
        'project_id': projectId,
        'lane_id': laneId,
        'with_options': {
          'with_users': true,
          'with_sub_tasks': true
        }
      }
    })
  }
}

export default LaneService;
