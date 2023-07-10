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

    static getLintProjects() {
        return Resource.get({
            'resource': 'project.projects',
            'data': {}
        });
    }

    static getProject(id, with_options = {}) {
        return Resource.get({
            'resource': 'project.project',
            'data': {
                'id': id,
                'with_options': {
                    'with_users': true,
                    'with_bots': true,
                    'with_tags': true,
                    'with_lanes': true
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

    static getBots(projectId) {
        return Resource.get({
            'resource': 'project.bots',
            'data': {
                project_id: projectId
            }
        });
    }

    static addBot(projectId, botId) {
        return Resource.put({
            'resource': 'project.bot',
            'data': {
                project_id: projectId,
                bot_id: botId
            }
        });
    }

    static deleteBot(projectId, botId) {
        return Resource.delete({
            'resource': 'project.bot',
            'data': {
                project_id: projectId,
                bot_id: botId
            }
        });
    }

    static getBotTask(projectId, taskType) {
        return Resource.get({
            'resource': 'project.bot_task',
            'data': {
                project_id: projectId,
                task_type: taskType
            }
        });
    }

    static setBotTask(projectId, botId, taskType, taskRule) {
        return Resource.post({
            'resource': 'project.bot_task',
            'data': {
                project_id: projectId,
                bot_id: botId,
                task_type: taskType,
                task_rule: taskRule
            }
        });
    }
}

export default ProjectService;
