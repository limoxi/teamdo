import Resource from '@/utils/resource';

class ProjectService {

  static getProjectIdFromPath(path) {
    let splits = path.split('/');
    return parseInt(splits[splits.length - 2]);
  }

  static getProjects() {
    return Resource.get({
      'resource': 'project.projects',
      'data': {
        'with_options': {
          'with_users': true
        }
      }
    });
  }

  static getProject(id, with_options = {}) {
    return Resource.get({
      'resource': 'project.project',
      'data': {
        'id': id,
        'with_options':{
          'with_manager': true,
          'with_kanban': with_options['with_kanban'] || false,
          'with_sprint': with_options['with_sprint'] || false
        }
      }
    });
  }

  static createProject(name, desc) {
    return Resource.put({
      'resource': 'project.project',
      'data': {
        name: name,
        desc: desc
      }
    });
  }

  static updateProject(id, name, desc) {
    return Resource.post({
      'resource': 'project.project',
      'data': {
        id: id,
        name: name,
        desc: desc
      }
    });
  }

  static deleteProject(id) {
    return Resource.delete({
      'resource': 'project.project',
      'data': {
        id: id
      }
    });
  }

  static getProjectMembers(projectId, filters = {}) {
    return Resource.get({
      'resource': 'project.users',
      'data': {
        'project_id': projectId,
        'with_options': {
          'with_role': true
        },
        'filters': filters
      }
    })
  }

  static addMember(projectId, userId) {
    return Resource.put({
      'resource': 'project.user',
      'data': {
        'project_id': parseInt(projectId),
        'user_id': userId
      }
    })
  }

  static deleteMember(projectId, userId) {
    return Resource.delete({
      'resource': 'project.user',
      'data': {
        'project_id': parseInt(projectId),
        'user_id': userId
      }
    })
  }
}

export default ProjectService;
