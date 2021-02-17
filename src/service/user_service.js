import Resource from '@/utils/resource';

class UserService {

  static getUser(params) {
    return Resource.get({
      'resource': 'user.user',
      'data': params
    });
  }

  static searchUserByNickname(nickname) {
    return Resource.get({
      'resource': 'user.users',
      'data': {
        'filters': {
          'nickname__contains': nickname
        }
      }
    })
  }

  static getAllUsers() {
    return Resource.get({
      'resource': 'user.users',
      'data': {}
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
