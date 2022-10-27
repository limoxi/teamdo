import Resource from '@/utils/resource';

class StatsService {
  static getDailyStatsForProject(projectId, dateRange = undefined) {
    return Resource.get({
      'resource': 'stats.project.daily',
      'data': {
        'project_id': projectId,
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

  static getStatsForProjectUser(projectId, userId) {
    return Resource.get({
      'resource': 'stats.project.user',
      'data': {
        'project_id': projectId,
        'user_id': userId
      }
    })
  }

}

export default StatsService
