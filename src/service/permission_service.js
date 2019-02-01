
import Resource from '@src/utils/resource';

class PermissionService{

    static getAllGroups(successHandler, errorHandler){
        Resource.use('iscrum').get({
            'resource': 'rust.permission.groups',
            'data': {},
            'success': successHandler,
            'error': errorHandler
        });
    }
}

export default PermissionService;