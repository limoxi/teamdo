/**
 * 封装indexedDB，采用promise
 * 由于创建objectStore需要在onupgradeneeded事件中进行，所以需要在创建数据库或者升级版本的时候
 *  初始化或更新，但是升级版本会导致之前的数据被清空，因此，为方便数据管理和开发，在onupgradeneeded事件中，
 *  更新动作会先缓存历史数据，再导入到新版本库中
 *
 * 使用方法（前提：models配置）
 *      import EasyDB from 'easyDB';
 *      EasyDB.open('ihome', 'money').then(easyDB => {
 *          easyDB.get('income').then(data =>{
 *              //处理data
 *          })
 *      })
 * 方法说明：open(dbName, tableName) ===> 打开数据库,连接表
 *          get(key) ===> 获取数据
 *          set(data) ===> 插入数据
 */

import settings from '../config/config';

let indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB;

class EasyDB {
    constructor(dbName, tableName) {
        this.dbName = dbName;
        this.tableName = tableName;
        this.db = null;
        this.table = null;
    }

    static open(dbName, tableName) {
        let instance = new EasyDB(dbName, tableName);

        return new Promise((resolve, reject) => {
            let request = indexedDB.open(this.dbname);

            request.onerror = e => {
                console.error('本地数据库创建/打开失败', e);
                reject(e.target.errorCode);
            };
            request.onsuccess = e => {
                instance.db = e.target.result;
                instance.table = instance.db.transaction(tableName, 'readwrite').objectStore(tableName);
                resolve(instance);
            };

            request.onupgradeneeded = e => {
                console.log('升级数据库 ' + dbName + 'to version ' + request.result.version);
                instance.db = e.target.result;
                for(let tableName of settings.localTables){
                    if(!instance.db.objectStoreNames.contains(tableName)){
                        instance.table = instance.db.createObjectStore(tableName, {keyPath: 'mid'});
                    }
                }
                resolve(instance);
            };

        });
    }

    set(blob) {
        return new Promise((resolve, reject) => {
            let request = this.table.put(blob);
            request.onsuccess = resolve;
            request.onerror = reject;
        });

    }

    get(name) {
        return new Promise((resolve, reject) => {
            let tmpRequest = null;
            if (name) {
                tmpRequest = this.table.get(name);
                tmpRequest.onsuccess = function (e) {
                    resolve(e.target.result);
                };
                tmpRequest.onerror = reject;

            } else {
                tmpRequest = this.table.getAll();
                tmpRequest.onsuccess = function (e) {
                    resolve(e.target.result);
                };
                tmpRequest.onerror = reject;
            }
        });
    }
}

export default EasyDB;