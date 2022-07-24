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
          'with_users': true,
          'with_bots': true
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
          'with_users': true,
          'with_bots': true,
          'with_tags':true
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

  static addBot(projectId, avatar, name, token, remark) {
    return Resource.put({
      'resource': 'project.bot',
      'data': {
        project_id: projectId,
        avatar: avatar,
        name: name,
        token: token,
        remark: remark
      }
    });
  }

  static updateBot(projectId, botId, avatar, name, remark) {
    return Resource.post({
      'resource': 'project.bot',
      'data': {
        project_id: projectId,
        id: botId,
        name: name,
        avatar: avatar,
        remark: remark
      }
    });
  }

  static deleteBot(projectId, botId) {
    return Resource.delete({
      'resource': 'project.bot',
      'data': {
        project_id: projectId,
        id: botId
      }
    });
  }
}

export default ProjectService;
