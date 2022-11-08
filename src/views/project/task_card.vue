<template>
  <div :class="headerClasses" :taskId="task.id">
    <div class="aui-i-finish-tag" v-if="task.status === '已完成'">
      <strong>已完成</strong>
    </div>
    <div class="aui-i-header">
      <div>
        <Checkbox v-model="taskSelected" v-if="mode==='SELECT'"/>
        <Tag :color="taskColor" @click="onCLickTaskNo" class="aui-i-id">
          {{ task.type_name }}&nbsp;∙&nbsp;{{ taskNo }}
        </Tag>
      </div>
      <div class="aui-i-action">
        <Button v-show="!inFirstLane" icon="ios-undo" @click="onClickPre"></Button>
        <Button v-show="task.status !== '已完成'" icon="ios-flash" :class="flashClass"
                @click="onClickFlash"></Button>
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
        <Badge v-for="(tag, index) in task.tags" :color="tag.color" :text="tag.name" :key="index"
               class="aui-i-tag" @click="onClickTag(tag)"
        />
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
          <Icon type="md-quote" v-if="task.has_attention"
                style="cursor: pointer; font-size: 0.9rem"
                @click="onClickAttention"
          />
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
import {Badge, Button, Checkbox, Copy, Message, Modal, Space, Tooltip} from 'view-ui-plus'
import {computed, inject, onMounted} from "vue";
import {useConfigStore, useLaneStore, useModalStore, useTaskFilterStore, useTaskModeStore} from '@/store'
import {storeToRefs} from "pinia";

const configStore = useConfigStore()
const {prioritySight} = storeToRefs(configStore)

const modalStore = useModalStore()
const {userSelectModal, taskModal} = storeToRefs(modalStore)

const taskFilterStore = useTaskFilterStore()
const {tagId} = storeToRefs(taskFilterStore)

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
        userSelectModal.userSelected = false
      }
    }
  })
})

const props = defineProps(['task', 'lane', 'lanes', 'inFirstLane', 'inLastLane'])

const laneStore = useLaneStore()
const currLane = laneStore.getLane(props.lane.id)

const project = inject('project')
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
      return '#2b85e4'
    case 'OPT':
      return '#ff9900'
    case 'BUG':
      return '#ed4014'
    default:
      return 'default'
  }
})

const taskColor = computed(() => {
  if (prioritySight.value) {
    return importanceColor.value
  } else {
    return taskNameColor.value
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

let flashClass = computed(() => {
  if (props.task.flashing) {
    return 'aui-icon-scale red'
  } else {
    return 'aui-icon-scale'
  }
})
let headerClasses = computed(() => {
  if (props.task.flashing) {
    return `aui-task aui-task-type-${props.task.type} animation-flash`
  } else {
    return `aui-task aui-task-type-${props.task.type}`
  }
})

const onClickFlash = () => {
  currLane.value.switchTaskFlashing(props.task.id)
}

const onCLickSwitch = (targetLaneId) => {
  switchLane(targetLaneId)
}

const switchLane = (targetLaneId) => {
  laneStore.shuttleTask(project.value.id, targetLaneId, props.task, -1)
}

const onAddRelation = () => {
  modalStore.show('taskModal', {
    projectId: project.value.id,
    relatedTask: props.task
  })
}

const onClickEdit = (e, targetTaskId = undefined) => {
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

const onClickAttention = () => {
  TaskService.getTask(project.value.id, props.task.id).then(task => {
    let content = []
    task.attentions.forEach(att => {
      const f = att.checked ? '✅' : '⬜'
      content.push(`</br>${f} ${att.content}</br>`)
    })
    Modal.warning({
      title: '注意事项',
      width: '600px',
      content: content.join('')
    });
  }).catch(err => {
    Message.error(err.errMsg);
  });
}

const onClickTag = (tag) => {
  if (tagId.value === tag.id) return
  taskFilterStore.updateTagId(tag.id)
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

      .aui-i-tag {
        &:hover {
          cursor: pointer;
          margin-left: 1px;
          transition-duration: 0.3s;
          transition-timing-function: ease-in;
        }
      }
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

.red {
  color: #c72606;
}

</style>

<style scoped>
.animation-flash {
  animation: animation-flash 1500ms linear infinite both;
}

@keyframes animation-flash {
  0% {
    -webkit-transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  }
  3.2% {
    -webkit-transform: matrix3d(1.027, 0, 0, 0, 0, 1.045, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    transform: matrix3d(1.027, 0, 0, 0, 0, 1.045, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  }
  6.31% {
    -webkit-transform: matrix3d(1.033, 0, 0, 0, 0, 1.057, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    transform: matrix3d(1.033, 0, 0, 0, 0, 1.057, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  }
  6.41% {
    -webkit-transform: matrix3d(1.033, 0, 0, 0, 0, 1.057, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    transform: matrix3d(1.033, 0, 0, 0, 0, 1.057, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  }
  10.51% {
    -webkit-transform: matrix3d(1.027, 0, 0, 0, 0, 1.041, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    transform: matrix3d(1.027, 0, 0, 0, 0, 1.041, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  }
  12.71% {
    -webkit-transform: matrix3d(1.021, 0, 0, 0, 0, 1.026, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    transform: matrix3d(1.021, 0, 0, 0, 0, 1.026, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  }
  14.71% {
    -webkit-transform: matrix3d(1.016, 0, 0, 0, 0, 1.012, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    transform: matrix3d(1.016, 0, 0, 0, 0, 1.012, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  }
  18.92% {
    -webkit-transform: matrix3d(1.007, 0, 0, 0, 0, 0.99, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    transform: matrix3d(1.007, 0, 0, 0, 0, 0.99, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  }
  23.02% {
    -webkit-transform: matrix3d(1.001, 0, 0, 0, 0, 0.984, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    transform: matrix3d(1.001, 0, 0, 0, 0, 0.984, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  }
  25.23% {
    -webkit-transform: matrix3d(1, 0, 0, 0, 0, 0.985, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    transform: matrix3d(1, 0, 0, 0, 0, 0.985, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  }
  27.23% {
    -webkit-transform: matrix3d(0.999, 0, 0, 0, 0, 0.988, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    transform: matrix3d(0.999, 0, 0, 0, 0, 0.988, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  }
  31.33% {
    -webkit-transform: matrix3d(0.998, 0, 0, 0, 0, 0.997, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    transform: matrix3d(0.998, 0, 0, 0, 0, 0.997, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  }
  31.43% {
    -webkit-transform: matrix3d(0.998, 0, 0, 0, 0, 0.997, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    transform: matrix3d(0.998, 0, 0, 0, 0, 0.997, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  }
  35.54% {
    -webkit-transform: matrix3d(0.999, 0, 0, 0, 0, 1.003, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    transform: matrix3d(0.999, 0, 0, 0, 0, 1.003, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  }
  39.64% {
    -webkit-transform: matrix3d(0.999, 0, 0, 0, 0, 1.005, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    transform: matrix3d(0.999, 0, 0, 0, 0, 1.005, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  }
  56.36% {
    -webkit-transform: matrix3d(1, 0, 0, 0, 0, 0.999, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    transform: matrix3d(1, 0, 0, 0, 0, 0.999, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  }
  56.46% {
    -webkit-transform: matrix3d(1, 0, 0, 0, 0, 0.999, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    transform: matrix3d(1, 0, 0, 0, 0, 0.999, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  }
  73.07% {
    -webkit-transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  }
  81.48% {
    -webkit-transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  }
  89.69% {
    -webkit-transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  }
  100% {
    -webkit-transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  }
}
</style>
