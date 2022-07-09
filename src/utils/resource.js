import axios from 'axios';
import qs from 'qs';
import helper from './helper';
import Logger from '@/utils/logger';
import Cookies from 'js-cookie';

const CONTENT_TYPE = 'application/json; charset=UTF-8'; //application/x-www-form-urlencoded

axios.defaults.headers.post['Content-Type'] = CONTENT_TYPE;

axios.interceptors.request.use(function (config) {
  if (config.method === 'post' && config.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
    config.data = qs.stringify(config.data);
  }
  if (config.method === 'get') {
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
  }
  return config;
});

const DEFAULT_ERROR_CODE = 555;
const NET_ERROR = 554;

class ResourceException {

  constructor(obj) {
    this.code = obj.code || DEFAULT_ERROR_CODE;
    this.errMsg = obj.errMsg;
  }

  toString() {
    return `resource_exception: code(${this.code}, errMsg(${this.errMsg}))`;
  }
}

let defaultResource;

class Resource {

  constructor(serviceName = 'iteamdo') {
    this.serviceName = serviceName;
  }

  static use(serviceName) {
    return new this(serviceName);
  }

  uploadFile(data) {
    let formData = new FormData();
    formData.append("name", data.filename);
    formData.append("file", data.file);
    let resource = 'uploaded_resource.image';

    axios.post(this._get_request_url(resource, {
      '_method': 'put'
    }), formData, {
      headers: {
        'Authorization': Cookies.get('token'),
        'Content-Type': 'multipart/form-data'
      },
      async: true,
      timeout: 3000,
      resource: resource
    });
  }

  static get(options) {
    if (!defaultResource) {
      defaultResource = new Resource();
    }
    return defaultResource.get(options);
  }

  static put(options) {
    if (!defaultResource) {
      defaultResource = new Resource();
    }
    return defaultResource.put(options);
  }

  static post(options) {
    if (!defaultResource) {
      defaultResource = new Resource();
    }
    return defaultResource.post(options);
  }

  static delete(options) {
    if (!defaultResource) {
      defaultResource = new Resource();
    }
    return defaultResource.delete(options);
  }


  _get_request_url(resource, param = null) {
    let url = `${location.protocol}//${location.host}/${this.serviceName}/${resource.replace(/\./g, '/')}/`;

    let params = [];
    param = param || {};
    param['__timestamp'] = new Date().getTime();
    for (let k in param) {
      if (['filters', 'with_options'].includes(k)) {
        param[k] = JSON.stringify(param[k])
      }
      let v = encodeURIComponent(param[k]);
      params.push(`${k}=${v}`);
    }
    let args = params.join('&');

    return `${url}?${args}`;
  }

  get(options) {
    let resource = options.resource;
    options.url = this._get_request_url(resource, options.data);
    options.method = 'get';
    return this._request(options);
  }

  put(options) {
    let resource = options.resource;
    options.url = this._get_request_url(resource);
    options.method = 'put';
    return this._request(options);
  }

  post(options) {
    let resource = options.resource;
    options.url = this._get_request_url(resource);
    options.method = 'post';
    return this._request(options);
  }

  delete(options) {
    let resource = options.resource;
    options.url = this._get_request_url(resource);
    options.method = 'delete';
    return this._request(options);
  }

  async _request(options) {
    Logger.log(options.url, options.data);
    let token = Cookies.get('token');
    let headers = {};
    if (token) {
      headers['Authorization'] = token;
    }
    options = helper.extend({
      url: options.url,
      method: options.method,
      data: {},
      headers: headers,
      async: true,
      timeout: 3000,
      onTimeout: helper.noop,
      success: helper.noop,
      error: helper.noop,
      resource: options.resource
    }, options);

    try {
      let resp = await axios(options);
      if (resp.data.state !== 'error') {
        return resp.data.data;
      } else {
        throw new ResourceException({
          code: resp.data.code,
          errMsg: resp.data.data.errMsg
        })
      }
    } catch (err) {
      Logger.alert(err);
      if (err instanceof ResourceException) {
        throw err;
      }
      throw new ResourceException({
        code: NET_ERROR,
        errMsg: '网络异常'
      });
    }
  }
}

export default Resource;
