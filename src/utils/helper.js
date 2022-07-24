import moment from "moment";
import 'moment/dist/locale/zh-cn';
moment.locale('zh-cn');

let storage = window.localStorage;

class LocalStorage {

  get(key, defaultValue) {
    if (!key) return;
    return JSON.parse(storage.getItem(key)) || defaultValue;
  }

  set(key, value) {
    if (typeof value === 'function') {
      value = value();
      storage.setItem(key, value);
    } else {
      storage.setItem(key, JSON.stringify(value));
    }
  }

  remove(key) {
    storage.removeItem(key);
  }

  clear() {
    storage.clear();
  }
}

export default {
  noop() {
  },

  //查询是否为空
  isEmptyObject(obj) {
    for (let i in obj) {
      return false;
    }
    return true;
  },

  //将得到的background-color由rgb格式(rgb(255, 255, 255))转换为hex格式(#ffffff)
  rgbToHex(bgColor) {
    if (!bgColor) return;
    bgColor = bgColor.substring(4, bgColor.length - 1).split(',');
    let r = parseInt(bgColor[0]);
    let g = parseInt(bgColor[1]);
    let b = parseInt(bgColor[2]);
    return '#' + r.toString(16) + g.toString(16) + b.toString(16);
  },

  extend(target, src) {
    for (let name in src) {
      if (src.hasOwnProperty(name)) {
        target[name] = src[name];
      }
    }
    return target;
  },

  delay(func, seconds) {
    setTimeout(func, seconds * 1000);
  },

  removeFromArray(el, list, key = null) {
    /**
     * 从数组中移除指定元素
     */
    let elIndex = list.findIndex(item => {
      if (key) {
        return item[key] === el[key];
      } else {
        return item === el;
      }
    });
    if (elIndex !== -1) {
      list.splice(elIndex, 1);
    }
    return elIndex;
  },

  storage: new LocalStorage(),

  formatTime(timeStr) {
    return moment(timeStr, 'YYYY-MM-DD HH:mm:ss').calendar()
  }
};
