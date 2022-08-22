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

}

export default StatsService
