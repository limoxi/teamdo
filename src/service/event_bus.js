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
    console.log('================', this.keys)
    if (key !== ''){
      if (this.keys.includes(key)) {
        return
      }
      this.keys.push(key)
    }
    this.events[eventName] = this.events[eventName] || [];
    this.events[eventName].push(fn);
  }
}

const events = {
  'THEME_CHANGED': 'themeChanged', // 主题切换
  'HELP_REQUEST': 'helpRequest',  // 打开帮助信息
  'HELP_DONE': 'helpDone',  // 关闭帮助信息
  'CREATING_PROJECT': 'creating_project',  // 创建项目
  'EDIT_PROJECT':'edit_project',  // 修改项目
  'DELETE_PROJECT': 'delete_project',  // 删除项目
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

const eventBus = new EventBus()
export {events, eventBus as EventBus};
