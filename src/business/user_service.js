import Resource from '@/utils/resource';
import User from "./model/user";

class UserService {

    static getUser(params) {
        return Resource.get({
            'resource': 'user.user',
            'data': params
        });
    }

    static async getUsers(filters = undefined) {
        const users = await Resource.get({
            'resource': 'user.users',
            'data': {
                filters: filters || {}
            }
        })
        return users.map(user => new User(user))
    }

    static searchUserByNickname(nickname) {
        return UserService.getUsers({
            'nickname__contains': nickname
        })
    }

    static doRegister(params) {
        return Resource.put({
            'resource': 'user.registered_user',
            'data': params
        });
    }

    static updateUser(params) {
        return Resource.post({
            'resource': 'user.user',
            'data': params
        });
    }

    static doLogin(username, password) {
        return Resource.put({
            'resource': 'user.logined_user',
            'data': {
                'username': username,
                'password': password,
                'login_key': username,
                'login_secret': password
            }
        });
    }

    static updatePwd(oldP, newP) {
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
