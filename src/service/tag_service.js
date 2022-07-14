import Resource from '@/utils/resource';

class TagService {

  static getTagsForProject(projectId) {
    return Resource.get({
      'resource': 'project.tags',
      'data': {
        'project_id': projectId,
      }
    })
  }

}

export default TagService
