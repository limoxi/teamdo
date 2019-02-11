
import Resource from '@/utils/resource';

class ProjectService{

    static getProjects(){
        return Resource.use('iscrum').get({
            'resource': 'project.projects',
            'data': {}
        });
    }

    static getProject(id){
        return Resource.use('iscrum').get({
            'resource': 'project.project',
            'data': {
                'id': id,
                'with_options': JSON.stringify({
                    'with_manager': true
                })
            }
        });
    }

    static createProject(name, desc){
        return Resource.use('iscrum').put({
            'resource': 'project.project',
            'data': {
                name: name,
                desc: desc
            }
        });
    }

    static updateProject(id, name, desc){
        return Resource.use('iscrum').post({
            'resource': 'project.project',
            'data': {
                id: id,
                name: name,
                desc: desc
            }
        });
    }

    static deleteProject(id){
        return Resource.use('iscrum').delete({
            'resource': 'project.project',
            'data': {
                id: id
            }
        });
    }

    static getProjectMembers(projectId){
        return Resource.use('iscrum').get({
            'resource': 'project.project_users',
            'data': {
                'project_id': projectId,
                'with_options': JSON.stringify({
                    'with_role': true
                })
            }
        })
    }

    static addMembers(projectId, userIds){
        return Resource.use('iscrum').put({
            'resource': 'project.project_users',
            'data': {
                'project_id': projectId,
                'user_ids': JSON.stringify(userIds)
            }
        })
    }

    static deleteMembers(projectId, userIds){
        return Resource.use('iscrum').delete({
            'resource': 'project.project_users',
            'data': {
                'project_id': projectId,
                'user_ids': JSON.stringify(userIds)
            }
        })
    }
}

export default ProjectService;