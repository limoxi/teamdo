

import Resource from '@/utils/resource';

class UserService{

    static getUser(params){
        return Resource.get({
            'resource': 'user.user',
            'data': params
        });
    }

    static getAllUsers(){
        return Resource.get({
            'resource': 'rust.user.users',
            'data': {
                cur_page: 1,
                count_per_page: 99999,
            }
        })
    }

    static doRegister(params){
        return Resource.put({
            'resource': 'user.registered_user',
            'data': params
        });
    }

    static updateUser(params){
        return Resource.post({
            'resource': 'user.user',
            'data': params
        });
    }

    static doLogin(username, password){
        return Resource.put({
            'resource': 'user.logined_user',
            'data': {
                'username': username,
                'password': password
            }
        });
    }

    static updatePwd(oldP, newP){
        return Resource.post({
            'resource': 'user.password',
            'data': {
                old_pwd: oldP,
                new_pwd: newP
            }
        });
    }
}

export default UserService;