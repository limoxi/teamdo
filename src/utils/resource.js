
import axios from 'axios';
import qs from 'qs';
import Cookies from 'js-cookie';
import helper from './helper';
import env from '@src/env';


axios.interceptors.request.use(config =>{
    config.data = qs.stringify(config.data);
    config.headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    };
    return config;
});

axios.interceptors.response.use(resp =>{
    return resp;
});


class Resource{

    constructor(serviceName, apiHost='api.ihome.com'){
        this.serviceName = serviceName;
        this.apiHost = apiHost;
    }

    static use(serviceName){
        return new this(serviceName);
    }

    _get_request_url(resource, param){
        if(Cookies.get('sid')){
            param = helper.extend(param, {sid: Cookies.get('sid')});
        }

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
            let v = param[k];
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

    _request(options){
        console.log(options.url);
        options = helper.extend({
            url: options.url,
            method: options.method,
            type:'json',
            data: {},
            async: true,
            timeout: 3000,
            onTimeout: helper.noop,
            before: helper.noop,
            progress: helper.noop,
            success: helper.noop,
            error: helper.noop,
            end: helper.noop,
        }, options);

        axios(options).then((resp)=>{
            if(resp.data.code === 200){
                options.success(resp.data.data);
            }else{
                options.error(resp.data.data);
            }
        }).catch ((err) =>{
            options.error({
                errMsg: '网络出错',
                innerMsg: err
            });
        });
    }
}

export default Resource;