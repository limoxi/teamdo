<template>
  <div :class="headerClasses">
    <div class="aui-i-header">

      <div>
        <Tag :color="importanceColor" @click="onCLickTaskNo">{{ task.type_name }}&nbsp;∙&nbsp;{{ taskNo }}</Tag>
      </div>
      <div class="aui-i-action">
        <Button v-show="!inFirstLane" icon="ios-undo" @click="onClickPre"></Button>
        <Button icon="md-qr-scanner" class="aui-icon-scale" @click="onClickEdit(task)"></Button>
        <Dropdown trigger="click" transfer placement="right-start" @on-click="onCLickSwitch">
          <Button icon="md-jet" />
          <template #list>
            <DropdownMenu>
              <template v-for="l in lanes" :key="l.id">
                <DropdownItem :name="l.id" v-if="lane.id !== l.id">
                  {{ l.name }}
                </DropdownItem>
              </template>
            </DropdownMenu>
          </template>
        </Dropdown>
        <Button icon="md-arrow-round-forward" class="aui-icon-scale" @click="onClickNext"></Button>
      </div>
    </div>
    <div class="aui-i-body">
      <div class="aui-i-name">
        {{ task.name }}
      </div>
      <div class="aui-i-tags">

      </div>
      <div class="aui-i-users">
        <div v-for="(user, index) in task.users" :key="user.id" :style="user.is_assignor?'float:right;':''">
          <Tooltip :content="user.nickname" placement="top">
            <Avatar
                :style="{marginLeft: '-15px', zIndex: index}"
                :src="user.avatar||defaultAvatar"
                :size="user.is_assignor? 'large': 'default'"
            ></Avatar>
          </Tooltip>
        </div>
      </div>
      <div>
        <Checkbox v-model="task._checked"
          v-if="showCheckBox"
        />
      </div>
      <div class="aui-i-time">
        <Icon type="md-play" class="aui-i-up"/>
        {{ formatTime(task.updated_at) }}
      </div>
    </div>
  </div>
</template>

<script setup>

import TaskService from '@/service/task_service';
import {events, EventBus} from '@/service/event_bus'
import defaultAvatar from '@/images/default-avatar.webp';
import {Message, Copy} from 'view-ui-plus'
import {computed, inject} from "vue";

const props = defineProps(['task', 'lane', 'lanes', 'inFirstLane', 'inLastLane', 'showCheckBox'])
const project = inject('project')
const headerClasses = computed(() => `aui-task aui-task-type-${props.task.type}`)
const importanceDesc = computed(() => {
  let imp = props.task.importance;
  let str = '';
  if (imp <= 3) {
    str = '一般';
  } else if (imp <= 6) {
    str = '紧急';
  } else if (imp <= 9) {
    str = '非常紧急';
  }
  return str;
})

const importanceColor = computed(() => {
  let imp = importanceDesc.value;
  let clr = 'primary';
  if (imp === '紧急') {
    clr = 'warning';
  } else if (imp === '非常紧急') {
    clr = 'error';
  }
  return clr;
})

const taskNameColor = computed(() => {
  switch (props.task.type) {
    case 'REQ':
    case 'OPT':
      return 'primary'
    case 'BUG':
      return 'error'
    default:
      return 'default'
  }
})

const taskNo = `${project.prefix}${props.task.id}`

const formatTime = (timeStr) => {
  let sps = timeStr.split('-')
  sps.shift()
  sps = sps.join('-').split(':')
  sps.pop()
  return sps.join(':')
}

const onCLickTaskNo = () => {
  Copy({
    text: taskNo,
    successTip: `${taskNo} 已复制`
  })
}

const onClickNext = () => {
  let targetLane;
  for (let index in props.lanes) {
    index = parseInt(index);
    let cl = props.lanes[index];
    if (cl.id === props.lane.id) {
      targetLane = props.lanes[index + 1];
      break;
    }
  }
  switchLane(targetLane.id)
}

const onClickPre = () => {
  let targetLane;
  for (let index in props.lanes) {
    index = parseInt(index);
    let cl = props.lanes[index];
    if (cl.id === props.lane.id) {
      targetLane = props.lanes[index - 1];
      break;
    }
  }
  switchLane(targetLane.id)
}

const onCLickSwitch = (targetLaneId) => {
  switchLane(targetLaneId)
}

const switchLane = (targetLaneId) => {
  TaskService.switchLane(project.id, props.task, targetLaneId).then(() => {
    EventBus.emit(events.TASK_SWITCHED, props.task, props.lane.id, targetLaneId);
  }).catch(err => {
    Message.error(err.errMsg);
  });
}

const onClickEdit = (selectedTask) => {
  TaskService.getTask(project.id, selectedTask.id).then(task => {
    EventBus.emit(events.TASK_EXPANDED, task);
  }).catch(err => {
    Message.error(err.errMsg);
  });
}
</script>

<style scoped lang="less">
.aui-task {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin: 5px 0;
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
      display: flex;
      justify-content: flex-start;
      padding-left: 15px;
    }
    .aui-i-time{
      color: grey;
      position: absolute;
      bottom: 2px;
      right: 5px;
      font-size: 10px;

      .aui-i-up{
        margin-right: -4px;
        margin-bottom: 4px;
        transform: rotate(-90deg) scale(0.6);
        color: lightgreen;
      }
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
