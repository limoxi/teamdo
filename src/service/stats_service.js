import Resource from '@/utils/resource';

class StatsService {

  static statsForProjectTask(projectId) {
    return Resource.get({
      'resource': 'stats.project.task',
      'data': {
        'project_id': projectId,
      }
    })
  }

  static statsForProjectUser(projectId, userId) {
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
