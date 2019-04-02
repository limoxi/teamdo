

import Resource from '@/utils/resource';

class UserService{

    static getUser(params){
        return Resource.get({
            'resource': 'rust.user.user',
            'data': params
        });
    }

    static getAllUsers(){
        return Resource.get({
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
        return Resource.put({
            'resource': 'rust.user.registered_user',
            'data': params
        });
    }

    static updateUser(params){
        return Resource.post({
            'resource': 'rust.user.user',
            'data': params
        });
    }

    static doLogin(username, password){
        return Resource.put({
            'resource': 'rust.user.logined_user',
            'data': {
                'username': username,
                'password': password
            }
        });
    }

    static updatePwd(oldP, newP){
        return Resource.post({
            'resource': 'rust.user.password',
            'data': {
                old_pwd: oldP,
                new_pwd: newP
            }
        });
    }
}

export default UserService;