
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
}

export default ProjectService;