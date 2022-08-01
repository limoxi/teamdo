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

  on(eventName, fn, key='') {
    if (key !== ''){
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

const events = {
  'REFRESH_LANE_TASKS': 'refreshLaneTasks', // 刷新泳道任务
  'TASK_UPDATED': 'taskUpdated', // 任务已更新
  'TASK_SWITCHED': 'taskSwitched', // 任务流转
  'SWITCH_TASK_MODE': 'switchTaskMode', // 切换任务卡片模式
  'TASK_CHECKED':'taskChecked', // 任务已&未选中
}

export {events, EventBus};
