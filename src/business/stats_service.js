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

  static getStatsForProjectUser(projectId, userId) {
    return Resource.get({
      'resource': 'stats.project.user',
      'data': {
        'project_id': projectId,
        'user_id': userId
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
