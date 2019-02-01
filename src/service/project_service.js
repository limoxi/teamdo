
import Resource from '@src/utils/resource';

class ProjectService{

    static getProjects(successHandler, errorHandler){
        Resource.use('iscrum').get({
            'resource': 'project.projects',
            'data': {},
            'success': successHandler,
            'error': errorHandler
        });
    }
}

export default ProjectService;