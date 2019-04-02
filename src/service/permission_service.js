
import Resource from '@/utils/resource';

class PermissionService{

    static getAllGroups(){
        return Resource.get({
            'resource': 'rust.permission.groups',
            'data': {}
        });
    }
}

export default PermissionService;