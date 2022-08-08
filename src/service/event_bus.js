class EventBus {
  constructor() {
    this.events = {};
    this.keys = []
  }

  emit(eventName, ...data) {
    if (this.events[eventName]) {
      this.events[eventName].forEach(function (fn) {
        fn(...data);
      });
    }
  }

  on(eventName, fn, key = '') {
    if (key !== '') {
      const k = `${eventName}${key}`
      if (this.keys.includes(k)) {
        return
      }
      this.keys.push(k)
    }
    this.events[eventName] = this.events[eventName] || [];
    this.events[eventName].push(fn);
  }
}

const events = {}

export {events, EventBus};
