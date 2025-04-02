import Resource from '@/utils/resource';

class StatsService {
  static getDailyStatsForProject(projectId, dateRange = undefined) {
    return Resource.get({
      'resource': 'stats.project.daily',
      'data': {
        'project_id': projectId,
        'date_range': dateRange
      }
    })
  }

  static getStatsForProjectTask(projectId) {
    return Resource.get({
      'resource': 'stats.project.task',
      'data': {
        'project_id': projectId,
      }
    })
  }

  static getDailyStatsForProjectUser(projectId, userId, dateRange = undefined) {
    return Resource.get({
      'resource': 'stats.project.user.daily',
      'data': {
        'project_id': projectId,
        'user_id': userId,
        'date_range': dateRange
      }
    })
  }

  // getStatsForProjectUsers 项目成员各任务状态的数量
  static getStatsForProjectUsers(projectId) {
    return Resource.get({
      'resource': 'stats.project.users',
      'data': {
        'project_id': projectId,
        'view': 'task_count_by_status'
      }
    })
  }

  // getTaskCountStatsForProjectUsersInLanes 项目成员在泳道中的新任务数量
  static getTaskCountStatsForProjectUsersInLanes(projectId, fromLaneRole, laneIds, statsDate) {
    return Resource.get({
      'resource': 'stats.project.users',
      'data': {
        'project_id': projectId,
        'from_lane_role': fromLaneRole,
        'lane_ids': laneIds.join(','),
        'stats_date': statsDate,
        'view': 'new_task_count_in_lanes'
      }
    })
  }

  static getStatsForProjectUser(projectId, userId) {
    return Resource.get({
      'resource': 'stats.project.user',
      'data': {
        'project_id': projectId,
        'user_id': userId
      }
    })
  }

  static getStatsForProjectUsersInLane(projectId, laneId) {
    return Resource.get({
      'resource': 'stats.project.kanban.lane.users',
      'data': {
        'project_id': projectId,
        'lane_id': laneId,
      }
    })
  }

  static getDailyActiveStatsForProjectUser(projectId, userId, dateRange = undefined) {
    return Resource.get({
      'resource': 'stats.project.user.active.daily',
      'data': {
        'project_id': projectId,
        'user_id': userId,
        'date_range': dateRange
      }
    })
  }

}

export default StatsService
