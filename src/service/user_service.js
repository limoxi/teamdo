

import Resource from '@/utils/resource';

class UserService{

    static getUser(params){
        return Resource.use('iscrum').get({
            'resource': 'rust.user.user',
            'data': params
        });
    }

    static getAllUsers(){
        return Resource.use('iscrum').get({
            'resource': 'rust.user.users',
            'data': {
                cur_page: 1,
                count_per_page: 99999,
                with_options: JSON.stringify({
                    'with_group_info': true
                })
            }
        })
    }

    static doRegister(params){
        return Resource.use('iscrum').put({
            'resource': 'rust.user.registered_user',
            'data': params
        });
    }

    static updateUser(params){
        return Resource.use('iscrum').post({
            'resource': 'rust.user.user',
            'data': params
        });
    }

    static doLogin(username, password){
        return Resource.use('iscrum').put({
            'resource': 'rust.user.logined_user',
            'data': {
                'username': username,
                'password': password
            }
        });
    }

    static updatePwd(oldP, newP){
        return Resource.use('iscrum').post({
            'resource': 'rust.user.password',
            'data': {
                old_pwd: oldP,
                new_pwd: newP
            }
        });
    }
}

export default UserService;