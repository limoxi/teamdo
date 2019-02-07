
import Resource from '@src/utils/resource';

class PermissionService{

    static getAllGroups(){
        return Resource.use('iscrum').get({
            'resource': 'rust.permission.groups',
            'data': {}
        });
    }
}

export default PermissionService;