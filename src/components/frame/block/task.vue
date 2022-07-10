<template>
  <div :class="headerClasses">
    <div class="aui-i-header">
      <div @click="onCLickTaskNo">
        {{ taskNo }}
      </div>
      <div class="aui-i-action">
        <Button v-show="!inFirstLane" icon="ios-undo" @click="onClickPre"></Button>
        <Button icon="md-qr-scanner" class="aui-icon-scale" @click="onClickEdit(task)"></Button>
<!--        <Dropdown trigger="click" placement="bottom" @on-click="onClickSwitch">-->
<!--          <Button icon="md-swap"></Button>-->
<!--          <template #list>-->
<!--            <DropdownMenu>-->
<!--              <DropdownItem-->
<!--                  v-for="l in lanes" :key="l.id" :name="l.id"-->
<!--                  v-if="lane.id !== l.id"-->
<!--              >-->
<!--                {{ l.name }}-->
<!--              </DropdownItem>-->
<!--            </DropdownMenu>-->
<!--          </template>-->
<!--        </Dropdown>-->
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
  </div>
</template>

<script setup>

import TaskService from '@/service/task_service';
import {events, EventBus} from '@/service/event_bus'
import defaultAvatar from '@/images/default-avatar.webp';
import {Message, Copy} from 'view-ui-plus'
import {computed, inject} from "vue";

const props = defineProps(['task', 'lane', 'lanes', 'inFirstLane', 'inLastLane'])
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
  let clr = 'success';
  if (imp === '紧急') {
    clr = 'warning';
  } else if (imp === '非常紧急') {
    clr = 'error';
  }
  return clr;
})

const taskNo = `${project.prefix}${props.task.id}`

const onCLickTaskNo = () => {
  Copy({
    text: taskNo,
    successTip: `任务编号:${taskNo} 已复制`
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
