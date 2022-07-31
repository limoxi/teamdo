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
  'LANE_ADDING': 'laneAdding', // 增加泳道
  'LANE_UPDATED': 'laneUpdated', // 泳道已更新
  'LANE_EDITING': 'LaneEditing', // 泳道信息编辑
  'REFRESH_LANE_TASKS': 'refreshLaneTasks', // 刷新泳道任务
  'TASK_ADDING': 'taskAdding', // 增加任务
  'TASK_ADDED': 'taskAdded', // 任务已添加
  'TASK_UPDATED': 'taskUpdated', // 任务已更新
  'TASK_EXPANDED': 'taskExpanded', // 任务被选中放大
  'TASK_REMOVED': 'taskRemoved', // 任务被移除泳道
  'TASK_UNDO': 'taskUndo', // 任务被回退到任务池中
  'TASK_SWITCHED': 'taskSwitched', // 任务流转
  'TASK_INSPECTING': 'taskInspecting', // 查看任务变动记录
  'USER_UPDATED': 'userUpdated', // 用户信息已更新
  'SELECTING_USER': 'selectingUser', // 选择用户
  'USER_SELECTED': 'userSelected', // 用户已选择
  'TASK_SELECTING': 'taskSelecting', // 选择任务中
  'SWITCH_TASK_MODE': 'switchTaskMode', // 切换任务卡片模式
  'TASK_CHECKED':'taskChecked', // 任务已&未选中
  'MESSAGE_SENT': 'messageSent',  // 消息已发送
  'ADD_BOT': 'addBot',  // 添加机器人
  'UPDATE_BOT': 'updateBot',  // 更新机器人
  'DELETE_BOT': 'deleteBot',  // 删除机器人
}

export {events, EventBus};
