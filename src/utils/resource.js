
import axios from 'axios';
import qs from 'qs';
import Cookies from 'js-cookie';
import helper from './helper';
import env from '@/env';
import Logger from '@/utils/logger';

const CONTENT_TYPE = 'application/json; charset=UTF-8' //application/x-www-form-urlencoded

axios.defaults.headers.post['Content-Type'] = CONTENT_TYPE;

axios.interceptors.request.use(function (config) {
    if(config.method === 'post' && CONTENT_TYPE === 'application/x-www-form-urlencoded'){
        config.data = qs.stringify(config.data);
    }
    return config;
});

const DEFAULT_ERROR_CODE = 555;
const NET_ERROR = 554;

class ResourceException{

    constructor(obj){
        this.code = obj.code || DEFAULT_ERROR_CODE;
        this.errMsg = obj.errMsg;
    }

    toString(){
        return `resource_exception: code(${this.code}, errMsg(${this.errMsg}))`;
    }
}

class Resource{

    constructor(serviceName, apiHost=env.API_HOST){
        this.serviceName = serviceName;
        this.apiHost = apiHost;
    }

    static use(serviceName){
        return new this(serviceName);
    }

    _get_request_url(resource, param){
        let routes = resource.split('.');
        let url = ['http:/', this.apiHost];
        url.push(this.serviceName);

        if(routes.length === 3){
            url.push(`${routes[0]}.${routes[1]}/${routes[2]}`);
        }else if(routes.length === 2){
            url.push(`${routes[0]}/${routes[1]}`);
        }
        url = url.join('/');

        let params = [];
        for(let k in param){
            let v = encodeURIComponent(param[k]);
            params.push(`${k}=${v}`);
        }
        let args = params.join('&');

        return `${url}?${args}`;
    }

    get(options){
        let resource = options.resource;
        options.url = this._get_request_url(resource, options.data);
        options.method = 'get';
        return this._request(options);
    }

    put(options){
        let resource = options.resource;
        let param = {'_method': 'put'};
        options.url = this._get_request_url(resource, param);
        options.method = 'post';
        return this._request(options);
    }

    post(options){
        let resource = options.resource;
        let param = {'_method': 'post'};
        options.url = this._get_request_url(resource, param);
        options.method = 'post';
        return this._request(options);
    }

    delete(options){
        let resource = options.resource;
        let param = {'_method': 'delete'};
        options.url = this._get_request_url(resource, param);
        options.method = 'post';
        return this._request(options);
    }

    async _request(options){
        Logger.log(options.url, options.data);
        options = helper.extend({
            url: options.url,
            method: options.method,
            data: {},
            headers: {
                'Authorization': Cookies.get('token')
            },
            async: true,
            timeout: 3000,
            onTimeout: helper.noop,
            success: helper.noop,
            error: helper.noop,
        }, options);

        try {
            let resp = await axios(options);
            if(resp.data.code === 200){
                return resp.data.data;
            }else{
                if(resp.data.errMsg === '不合法的token'){
                    Cookies.remove('token');
                    window.location.href = '/';
                }else{
                    throw new ResourceException({
                        code: resp.data.code,
                        errMsg: resp.data.errMsg
                    })
                }
            }
        }catch (err) {
            Logger.alert(err);
            if(err instanceof ResourceException){
                throw err;
            }
            throw new ResourceException({
                code:  NET_ERROR,
                errMsg: '网络异常'
            });
        }
    }
}

export default Resource;