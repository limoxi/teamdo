<template>
  <div :class="headerClasses" :taskId="task.id">
    <div class="aui-i-finish-tag" v-if="task.status === '已完成'">
      <strong>已完成</strong>
    </div>
    <div class="aui-i-header">
      <div>
        <Checkbox v-model="taskSelected" v-if="mode==='SELECT'"/>
        <Tag :color="importanceColor" @click="onCLickTaskNo" class="aui-i-id">
          {{ task.type_name }}&nbsp;∙&nbsp;{{ taskNo }}
        </Tag>
      </div>
      <div class="aui-i-action">
        <Button v-show="!inFirstLane" icon="ios-undo" @click="onClickPre"></Button>
        <Button icon="md-qr-scanner" class="aui-icon-scale" @click="onClickEdit"></Button>
        <Button icon="ios-link" class="aui-icon-scale" @click="onAddRelation"></Button>
        <Dropdown trigger="click" transfer placement="right-start" @on-click="onCLickSwitch">
          <Button icon="md-jet"/>
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
        <Button v-if="!inLastLane"
                icon="md-arrow-round-forward" class="aui-icon-scale" @click="onClickNext"></Button>
      </div>
    </div>
    <div class="aui-i-body">
      <div class="aui-i-name" @dblclick="onCLickName">
        {{ task.name }}
      </div>
      <div class="aui-i-tags">
        <Badge :color="importanceColor" :text="`${importanceDesc}(${task.importance})`"></Badge>
        <Badge v-if="task.type === 'BUG'" color="#ed4014" text="BUG"></Badge>
        <Badge v-for="(tag, index) in task.tags" :color="tag.color" :text="tag.name" :key="index"/>
      </div>
      <div class="aui-i-users">
        <Tooltip v-if="!!assignor"
                 :content="assignor.nickname" placement="right"
                 style="cursor: pointer" @click="onSelectAssignor">
          <Avatar
              :src="assignor.avatar||defaultAvatar"
          ></Avatar>
        </Tooltip>
        <Tooltip v-else content="添加执行人"
                 placement="right" style="cursor: pointer" @click="onSelectAssignor">
          <Avatar
              icon="md-person"
          ></Avatar>
        </Tooltip>
      </div>
      <div class="aui-i-extra">
        <Space :size="4">
          <Icon type="md-paper" v-if="task.has_desc"/>
          <Tooltip placement="top"
                   v-if="task.related_task_id >0"
                   :content="`${project.prefix}${task.related_task_id}`">
            <Icon type="md-link" style="cursor: pointer; font-size: 1rem"
                  @click="onClickEdit($event, task.related_task_id)"/>
          </Tooltip>

          <Tooltip placement="top">
            <span>{{ task.sp }}/{{ task.passed_sp }}</span>
            <template #content>
              <p>期望故事点：{{ task.sp }}</p>
              <p>实际故事点：{{ task.passed_sp }}</p>
            </template>
          </Tooltip>
          <span @click="onClickLog" style="cursor: pointer">{{ helper.formatTime(task.updated_at) }}</span>
        </Space>
      </div>
    </div>
  </div>
</template>

<script setup>

import helper from '@/utils/helper';
import TaskService from '@/service/task_service';
import defaultAvatar from '@/images/default-avatar.webp';
import {Badge, Button, Checkbox, Copy, Message, Space, Tooltip} from 'view-ui-plus'
import {computed, inject, onMounted} from "vue";
import {useLaneStore, useModalStore, useTaskModeStore} from '@/store'
import {storeToRefs} from "pinia";

const modalStore = useModalStore()
const {userSelectModal, taskModal} = storeToRefs(modalStore)

const taskModeStore = useTaskModeStore()
const {mode, selectedTasks} = storeToRefs(taskModeStore)
let taskSelected = computed({
  get: () => selectedTasks.value.filter(task => task.id === props.task.id).length > 0,
  set: (v) => {
    taskModeStore.toggleTask(props.task, v)
    return v
  }
})

const actionRight = computed(() => {
  if (props.task.status === '已完成') {
    return '46px'
  } else {
    return '5px'
  }
})

onMounted(() => {
  modalStore.$subscribe((_, state) => {
    const userSelectModal = state.userSelectModal
    if (userSelectModal.userSelected) {
      if (userSelectModal.taskId === props.task.id) {
        currLane.value.setTaskAssignor(props.task, userSelectModal.selectedUserId)
      }
    }
  })
})

const props = defineProps(['task', 'lane', 'lanes', 'inFirstLane', 'inLastLane'])

const laneStore = useLaneStore()
const currLane = laneStore.getLane(props.lane.id)

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
  for (let user of project.value.users) {
    if (user.id === props.task.assignor_id) {
      return user
    }
  }
  return null
})

const taskNo = `${project.value.prefix}${props.task.id}`

const onCLickTaskNo = () => {
  let pre = ''
  switch (props.task.type) {
    case 'OPT':
      pre = 'perf'
      break
    case 'BUG':
      pre = 'bug'
      break
    default:
      pre = 'ft'
  }

  const t = `${pre}_${project.value.prefix.toLowerCase()}${props.task.id}`
  Copy({
    text: t,
    successTip: `${t} 已复制`
  })
}

const onCLickName = () => {
  Copy({
    text: props.task.name,
    successTip: '用户故事已复制'
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
  laneStore.shuttleTask(project.value.id, targetLaneId, props.task, 0)
}

const onAddRelation = () => {
  modalStore.show('taskModal', {
    projectId: project.value.id,
    relatedTask: props.task
  })
}

const onClickEdit = (e, targetTaskId = undefined) => {
  console.log(e, targetTaskId)
  let tid = targetTaskId || props.task.id
  TaskService.getTask(project.value.id, tid).then(task => {
    modalStore.show('taskModal', {
      'projectId': project.value.id,
      'task': task
    })
  }).catch(err => {
    Message.error(err.errMsg);
  });
}

const onClickLog = () => {
  modalStore.show('taskLogModal', {
    task: props.task
  })
}

const onSelectAssignor = () => {
  modalStore.show('userSelectModal', {
    projectId: project.value.id,
    taskId: props.task.id
  })
}

</script>

<style scoped lang="less">
.aui-theme-light .aui-i-finish-tag strong {
  color: #eee;
}

.aui-task {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin: 5px 0;
  padding: 10px;
  border-radius: 2px;
  overflow: hidden;

  &:hover {
    .aui-i-header {
      .aui-i-action {
        display: inline-block;
      }
    }
  }

  .aui-i-finish-tag {
    position: absolute;
    top: -5px;
    left: 215px;
    transform: rotate(45deg);
    background-color: #19be6b;
    width: 80px;
    height: 40px;
    text-align: center;

    strong {
      position: absolute;
      left: 20px;
      bottom: 0;
      width: max-content;
      transform: scale(0.9);
    }
  }

  .aui-i-header {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    font-weight: bold;

    .aui-i-action {
      position: absolute;
      top: 10px;
      right: v-bind(actionRight);
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
    margin-top: 5px;
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
    }

    .aui-i-tags {
      display: flex;
      justify-content: flex-start;
      flex-wrap: wrap;
      margin: 10px 0;
    }

    .aui-i-extra {
      color: grey;
      position: absolute;
      bottom: 2px;
      right: 10px;
      font-size: 10px;
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
