
import Cookies from 'js-cookie';
import Resource from '@src/utils/resource';
import helper from "@src/utils/helper";

class UserService{

    static getUser(options){
        Resource.use('iscrum').get({
            'resource': 'rust.user.user',
            'data': options.data,
            success: options.success || helper.noop,
            error: options.error || helper.noop
        });
    }

    static doRegister(params, successHandler, errorHandler){
        Resource.use('iscrum').put({
            'resource': 'rust.user.registered_user',
            'data': params,
            success: successHandler,
            error: errorHandler
        });
    }

    static updateUser(params, successHandler, errorHandler){
        Resource.use('iscrum').post({
            'resource': 'rust.user.user',
            'data': params,
            success: successHandler,
            error: errorHandler
        });
    }

    static doLogin(username, password, successHandler, errorHandler){
        Resource.use('iscrum').put({
            'resource': 'rust.user.logined_user',
            'data': {
                'username': username,
                'password': password
            },
            'success': (data) =>{
                Cookies.set('uid', data['id']);
                Cookies.set('token', data['token']);
                Cookies.set('nickname', data.nickname);
                Cookies.set('avatar', data.avatar);
                successHandler();
            },
            error: errorHandler
        })
    }
}

export default UserService;