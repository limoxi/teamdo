<template>
  <div :class="headerClasses" :taskId="task.id">
    <div class="aui-i-header">
      <div>
        <Checkbox v-model="taskSelected" v-if="mode==='CHECKING'" @on-change="onSelectChange" />
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
        <Badge :color="importanceColor" :text="importanceDesc"></Badge>
        <Badge v-for="tag in task.tags" :color="tag.color" :text="tag.name" />
      </div>
      <div class="aui-i-users">
          <Tooltip v-if="!!assignor" :content="assignor.nickname" placement="right">
            <Avatar
                :style="{marginLeft: '-15px'}"
                :src="assignor.avatar||defaultAvatar"
            ></Avatar>
          </Tooltip>
      </div>
      <div>
        <Checkbox v-model="task._checked"
          v-if="showCheckBox"
        />
      </div>
      <div class="aui-i-time">
        <Icon type="md-paper" v-if="task.desc.length > 0"/>
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
import {Message, Copy, Checkbox, Badge} from 'view-ui-plus'
import {ref, computed, inject, onMounted} from "vue";

onMounted(() => {
  EventBus.on(events.SWITCH_TASK_MODE, m => {
    mode.value = m
    taskSelected.value = false
  })
})

let mode = ref('NORMAL')
let taskSelected = ref(false)
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
  let clr = '#2b85e4';
  if (imp === '紧急') {
    clr = '#ff9900';
  } else if (imp === '非常紧急') {
    clr = '#ed4014';
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

const assignor = computed(() => {
  for(let user of props.task.users) {
    if (user.is_assignor) {
      return user
    }
  }
  return null
})

const taskNo = `${project.prefix}${props.task.id}`

const onSelectChange = checked => {
  EventBus.emit(events.TASK_CHECKED, props.task, checked)
}

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
    padding: 5px 10px;
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
    padding: 5px 10px;
    font-size: 14px;
    display: flex;
    justify-content: flex-start;
    flex-direction: column;

    .aui-i-name {
      min-height: 35px;
      display: flex;
      align-items: center;
    }

    .aui-i-users {
      display: flex;
      justify-content: flex-start;
      padding-left: 15px;
    }
    .aui-i-tags{
      display: flex;
      justify-content: flex-start;
      flex-wrap: wrap;
      margin: 5px 0;
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
