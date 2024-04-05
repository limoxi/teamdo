/**
 *@created date 2015-3-10
 *@updated date 2017-11-12
 *@author Asia
 *@version 0.5.0 AS
 */
let storage = window.localStorage;
let browserAgent = navigator.userAgent;

let AS = {
  currentMember: {
    id: 1,
    name: 'aix'
  },

  localStorage: {
    get: function (key, defaultValue) {
      if (!key) return;
      return JSON.parse(storage.getItem(key)) || defaultValue;
    },
    set: function (key, value) {
      if (typeof value === 'function') {
        value = value();
        storage.setItem(key, value());
      } else {
        storage.setItem(key, JSON.stringify(value));
      }
    },
    save: function (data, excludeKey) {
      if (AS.isString(data)) data = JSON.parse(data);
      if (!data || AS.isEmptyObject(data)) return;
      for (let key in data) {
        if (excludeKey && key === excludeKey) continue;
        AS.localStorage.set(key, JSON.stringify(data[key]));
      }
    },
    clear: function () {
      let uuid = AS.localStorage.get('uuid');
      let version = AS.localStorage.get('version');
      storage.clear();
      AS.localStorage.set('uuid', uuid);
      AS.localStorage.set('version', version);
    }
  },

  browser: {
    is_mobile: function () {
      return (/(iPhone|iPad|iPod|iOS|Android)/i.test(browserAgent) || browserAgent.indexOf('linux') > -1);
    },
    toString: function () {
      return browserAgent;
    },
    is_webkit: function () {
      return browserAgent.indexOf('AppleWebKit') > -1;
    },
    is_firefox: function () {
      return (browserAgent.indexOf('Gecko') > -1 && browserAgent.indexOf('KHTML') === -1);
    }
  },

  time() {
    let start = "2016-02-14 06:00:00";
    let startTime = new Date(start).getTime();
    window.setInterval(timing, 500);

    function timing() {
      let nowTime = new Date().getTime();
      let diffMs = nowTime - startTime;
      let year = Math.floor(diffMs / 1000 / 60 / 60 / 24 / 365);
      let month = Math.floor(diffMs / 1000 / 60 / 60 / 24 / 30 % 12);
      // let realMonth = Math.floor(diffMs / 1000 / 60 / 60 / 24 / 30);
      let day = Math.floor(diffMs / 1000 / 60 / 60 / 24 % 30);
      // let realDay = Math.floor(diffMs / 1000 / 60 / 60 / 24);
      let hour = Math.floor(diffMs / 1000 / 60 / 60 % 24);
      let min = Math.floor(diffMs / 1000 / 60 % 60);
      let sec = Math.floor(diffMs / 1000 % 60);
      let result = [];
      if (year !== 0) {
        result.push(year + '年');
      }
      result = result.join('');
      AS.time = result + '' + month + '月' + day + '天' + hour + '小时' + min + '分' + sec + '秒';
    }
  }

};

export default AS;
