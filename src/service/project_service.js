
import Resource from '@src/utils/resource';

class ProjectService{

    static getProjects(){
        return Resource.use('iscrum').get({
            'resource': 'project.projects',
            'data': {}
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
}

export default ProjectService;