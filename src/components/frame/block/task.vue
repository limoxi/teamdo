<template>
  <div :class="headerClasses">
    <div class="aui-i-header">
      <div>
        Story&nbsp;{{ task.id }}
      </div>
      <div class="aui-i-action">
        <Button v-show="inFirstLane" icon="ios-undo" @click="onClickUndo"></Button>
        <Button icon="md-qr-scanner" class="aui-icon-scale" @click="onClickEdit(task)"></Button>
        <Button v-show="!inFirstLane&&!inLastLane" icon="ios-flash" @click="onClickFlash"></Button>
        <Button icon="md-arrow-round-forward" class="aui-icon-scale" @click="onClickNext"></Button>
      </div>
    </div>
    <div class="aui-i-body">
      <div class="aui-i-status">
        <Tag :color="importanceColor">{{ importanceDesc }}</Tag>
        <Tag color="primary">{{ task.NUT }} / {{ task.elapsed_time || 0 }}</Tag>
      </div>
      <div class="aui-i-name">
        {{ task.name }}
      </div>
      <div class="aui-i-users">
        <div v-for="user in task.users" :key="user.id" :style="user.is_assignor?'float:right;':''">
          <Tooltip :content="user.nickname" placement="top">
            <Avatar :src="user.avatar||defaultAvatar" :size="user.is_assignor? 'large': 'default'"></Avatar>
          </Tooltip>
        </div>
      </div>
    </div>
    <!-- 弹窗组件 -->
    <task-model
      ref="taskModel"
      :projectId="projectId"
      :task="task"
  ></task-model>
  </div>
</template>

<script>

import TaskService from '@/service/task_service';
import {events, EventBus} from '@/service/event_bus'
import helper from '@/utils/helper';
import defaultAvatar from '@/images/default-avatar.webp';
import TaskModel from '@/components/model/task_model'

export default {
  props: ['projectId', 'task', 'lane', 'lanes', 'inFirstLane', 'inLastLane'],
  components: {
    TaskModel,
  },

  data() {
    return {
      defaultAvatar: defaultAvatar
    }
  },

  computed: {
    headerClasses() {
      return `aui-task aui-task-type-${this.task.type}`;
    },
    importanceDesc() {
      let imp = this.task.importance;
      let str = '';
      if (imp <= 3) {
        str = '一般';
      } else if (imp <= 6) {
        str = '紧急';
      } else if (imp <= 9) {
        str = '非常紧急';
      }
      return str;
    },
    importanceColor() {
      let imp = this.importanceDesc;
      let clr = 'success';
      if (imp === '紧急') {
        clr = 'warning';
      } else if (imp === '非常紧急') {
        clr = 'error';
      }
      return clr;
    }
  },

  methods: {

    onChangeProgress(task) {
      console.log(task.progress);
    },

    onClickNext() {
      let targetLane;
      for (let index in this.lanes) {
        index = parseInt(index);
        let cl = this.lanes[index];
        if (cl.id === this.lane.id) {
          targetLane = this.lanes[index + 1];
          break;
        }
      }
      TaskService.switchLane(this.projectId, this.task, targetLane.id).then(() => {
        EventBus.emit(events.TASK_SWITCHED, this.task, this.lane.id, targetLane.id);
      }).catch(err => {
        this.$Message.warning(err.errMsg);
      });
    },

    onClickSwitch(targetLaneId) {
      TaskService.switchLane(this.projectId, this.task, targetLaneId).then(() => {
        EventBus.emit(events.TASK_SWITCHED, this.task, this.lane.id, targetLaneId);
      }).catch(err => {
        this.$Message.warning(err.errMsg);
      });
    },

    onClickEdit(selectedTask) {
      TaskService.getTask(this.projectId, selectedTask.id).then(task => {
        // EventBus.emit(events.TASK_EXPANDED, task);
        this.$refs.taskModel.showTask(task)
      }).catch(err => {
        this.$Message.error(err.errMsg);
      });
    },

    onClickFlash() {
      console.log('notify');
    },
    
    onClickUndo() {
      TaskService.undoTask(this.projectId, this.task).then(() => {
        EventBus.emit(events.TASK_REMOVED, this.task, this.lane.id);
      }).catch(err => {
        this.$Message.warning(err.errMsg);
      });
    }
  }
}
</script>

<style scoped lang="less">
.aui-task {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin: 5px 0;
  min-height: 150px;
  border-radius: 2px;

  &:hover {
    .aui-i-header {
      .aui-i-action {
        display: inline-block;
      }
    }
  }

  .aui-i-header {
    display: flex;
    justify-content: space-between;
    padding: 5px;
    //color: #fff;
    font-size: 14px;
    font-weight: bold;

    .aui-i-action {
      position: absolute;
      top: 3px;
      right: 5px;
      display: none;

      .ivu-btn-icon-only {
        width: 26px;
        height: 26px;
        border-radius: 4px;
        border: none;
      }
    }
  }

  .aui-i-body {
    padding: 5px;
    font-size: 14px;
    display: flex;
    justify-content: flex-start;
    flex-direction: column;

    .aui-i-name {
      min-height: 45px;
      display: flex;
      align-items: center;
    }

    .aui-i-sub-tasks {
      border-radius: 5px;
      overflow: hidden;

      .aui-task-type-sub_task {
        margin-top: 2px;

        .aui-i-header, .aui-i-body {
          background-color: cadetblue;
          color: whitesmoke;
        }
      }
    }

    .aui-i-users {
      padding: 5px;
    }
  }

  .aui-task-type-sub_task {
    min-height: 50px;
  }

}

// 任务类型主题
.aui-task-type-task {
  .aui-i-header {
    background-color: #FF9900;
  }
}

.aui-task-type-bug {
  .aui-i-header {
    background-color: #FD6E6A;
  }
}
</style>
