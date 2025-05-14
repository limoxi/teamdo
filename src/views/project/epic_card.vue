<template>
  <div :class="headerClasses" :taskId="task.id">
    <div class="aui-i-header">
      <Space :size="1" split style="font-size: 12px">
        <Checkbox v-model="taskSelected" v-if="mode==='SELECT'"/>
        <Tooltip :content="creator.nickname" placement="right">
          <Avatar
              style="color:#ff9900;background-color: #e8eaec"
              :src="creator.avatar"
          >{{ (creator.nickname && creator.nickname[0]) || '' }}
          </Avatar>
        </Tooltip>
        <span @click="onCLickTaskNo" class="aui-i-id"># {{ task.id }}</span>
        <span :style="{color: getStatusColor(task.status)}">{{ task.status }}</span>
        <Badge :color="importanceColor" :text="`来源·${task.fromWhere}`"/>
      </Space>
      <div class="aui-i-action">
        <Button v-show="!lane.isFirst" icon="ios-undo" @click="onClickPre"></Button>
        <Button v-show="task.status !== '已完成'" icon="ios-flash" :class="flashClass"
                @click="onClickFlash"></Button>
        <Button icon="md-qr-scanner" class="aui-icon-scale" @click="onClickEdit"></Button>
        <Button icon="md-filing" class="aui-icon-scale" @click="onAddRelation"></Button>
        <Dropdown
            v-if="lanes.length > 1"
            trigger="click" transfer placement="right-start" @on-click="onCLickSwitch">
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
        <Button v-if="!lane.isLast"
                icon="md-arrow-round-forward" class="aui-icon-scale" @click="onClickNext"></Button>
      </div>
    </div>
    <div class="aui-i-body">
      <div class="aui-i-name" @dblclick="onCLickName">
        {{ task.name }}
      </div>
      <div class="aui-i-tags">
        <Badge :color="importanceColor" :text="`${importanceDesc}(${task.importance})`"></Badge>
        <template v-for="(tag, index) in task.tags" :key="index">
          <Badge v-if="index > 0" :color="tag.color" :text="tag.name"
                 class="aui-i-tag" @click="onClickTag(tag)"
          />
        </template>
        <Badge v-if="task.expectedFinishedAt" :color="importanceColor"
               :text="`截止于 ${helper.formatTime(task.expectedFinishedAt)}`"></Badge>
      </div>
      <div class="aui-i-extra">
        <Space :size="1" split>
          <Tooltip v-if="task.docLink" content="文档链接" placement="top">
            <a class="aui-i-link"
               :href="task.docLink"
               target="_blank">
              Doc
            </a>
          </Tooltip>
          <Tooltip v-if="task.designLink" content="设计链接" placement="top">
            <a class="aui-i-link"
               :href="task.designLink" target="_blank">
              Design
            </a>
          </Tooltip>

          <Icon type="md-quote" v-if="task.hasAttention"
                style="cursor: pointer; font-size: 0.9rem"
                @click="onClickAttention"
          />
          <Icon type="md-paper" v-if="task.hasDesc"/>
          <Poptip v-if="task.isParent" trigger="hover" placement="right" transfer
                  popper-class="aui-children-poptip"
                  @on-popper-show="onShowChildrenBox">
            <template #content>
              <template v-if="loadingChildren">
                <Skeleton loading animated>
                  <SkeletonItem width="280px" height="140px"/>
                </Skeleton>
              </template>
              <template v-else>
                <div class="aui-i-children-tasks">
                  <SimpleTaskCard
                      :show_project="true"
                      v-for="task in children"
                      :task="task"
                  ></SimpleTaskCard>
                </div>
              </template>
            </template>
            <!--            <Icon type="md-filing" style="font-size: 12px"/>-->
            <span
                :style="{color:getStatusColor(task.status), fontWeight: 'bold'}"
            >{{ task.progress }}%</span>
          </Poptip>
          <span @click="onClickLog" style="cursor: pointer">{{ helper.formatTime(task.updatedAt) }}</span>
        </Space>
      </div>
    </div>
  </div>
</template>

<script setup>

import helper from '@/utils/helper'
import TaskService from '@/business/task_service'
import EpicTaskService from '@/business/epic_task_service'
import {
  Avatar,
  Badge,
  Button,
  Checkbox,
  Copy,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  Icon,
  Message,
  Modal,
  Poptip,
  SkeletonItem,
  Space,
  Tooltip
} from 'view-ui-plus'
import {computed, inject, onMounted, ref} from "vue"
import {useModalStore, useTaskFilterStore, useTaskModeStore} from '@/store'
import {storeToRefs} from "pinia"
import {getImportanceColor, getImportanceDesc, getStatusColor} from '@/utils/constant'
import SimpleTaskCard from "@/components/simple_task_card.vue";

const modalStore = useModalStore()
const {usersSelectModal, taskModal} = storeToRefs(modalStore)

const taskFilterStore = useTaskFilterStore()
const {tagId} = storeToRefs(taskFilterStore)

const taskModeStore = useTaskModeStore()
const {mode, selectedTasks} = storeToRefs(taskModeStore)
let taskSelected = computed({
  get() {
    return selectedTasks.value.filter(task => task.id === props.task.id).length > 0
  },
  set(selected) {
    if (selected) {
      if (selectedTasks.value.filter(task => task.id === props.task.id).length === 0) {
        selectedTasks.value.push(props.task)
      }
    } else {
      const index = selectedTasks.value.findIndex(t => t.id === props.task.id)
      if (index >= 0) {
        selectedTasks.value.splice(index, 1)
      }
    }
  }
})

const props = defineProps(['task', 'lane'])
const emit = defineEmits(['onAdd', 'onRemove'])

const projectId = inject('projectId')
const project = inject('project')
const lanes = computed(() => {
  return project.value.epicLanes || []
})
const creator = computed(() => {
  return props.task.getCreator()
})

const loadingChildren = ref(true)
const children = ref([])

const importanceDesc = computed(() => {
  return getImportanceDesc(props.task.importance)
})

const importanceColor = computed(() => {
  return getImportanceColor(props.task.importance)
})

onMounted(() => {
  if (props.task.isParent) {
    setInterval(() => {
      loadingChildren.value = true
    }, 30 * 1000)
  }
})

const onCLickTaskNo = () => {
  const t = `#${props.task.id}`
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
  for (let index in lanes.value) {
    index = parseInt(index);
    let cl = lanes.value[index];
    if (cl.id === props.lane.id) {
      targetLane = lanes.value[index + 1];
      break;
    }
  }
  switchLane(targetLane.id)
}

const onClickPre = () => {
  let targetLane;
  for (let index in lanes.value) {
    index = parseInt(index);
    let cl = lanes.value[index];
    if (cl.id === props.lane.id) {
      targetLane = lanes.value[index - 1];
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
  project.value.switchTaskFlashing(props.task).then(() => {
    props.task.flashing = !props.task.flashing
  }).catch(err => {
    Message.error(err.errMsg || '操作失败');
  })
}

const onCLickSwitch = (targetLaneId) => {
  switchLane(targetLaneId)
}

const switchLane = (targetLaneId) => {
  const sourceLaneId = props.task.laneId
  project.value.shuttleTask(sourceLaneId, targetLaneId, props.task, -1, true)
}

const onAddRelation = () => {
  modalStore.show('taskModal', {
    projectId: projectId,
    relatedTask: props.task
  })
}

const onClickEdit = () => {
  let readonly = false

  EpicTaskService.getEpicTask(projectId, props.task.id).then(epicTask => {
    modalStore.show('epicModal', {
      projectId: projectId,
      task: epicTask,
      readonly: readonly
    })
  }).catch(err => {
    console.error(err)
    Message.error(err.errMsg);
  });
}

const onClickAttention = () => {
  TaskService.getTask(project.value.id, props.task.id).then(nTask => {
    let content = []
    nTask.attentions.forEach(att => {
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

const showRelatedTasks = () => {
  modalStore.show('subTasksModal', {
    task: props.task
  })
}

const onShowChildrenBox = () => {
  if (!loadingChildren.value) return

  if (!props.task.isParent) return

  TaskService.getChildrenById(props.task.id).then(respTasks => {
    children.value = respTasks
    loadingChildren.value = false
  })
}

</script>

<style lang="less">
.aui-children-poptip {
  .ivu-poptip-title:after {
    height: 0 !important;
  }

  .ivu-poptip-body {
    width: 100%;
    padding: 8px 8px !important;
    background-color: #eee;
    overflow-y: scroll;
    max-height: 277px;

    .aui-i-children-tasks {
      overflow-y: scroll;
      height: 100%;
      width: 270px;

      .aui-task {
        width: 100%;
        background-color: #fff;
      }
    }
  }
}

</style>

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
      top: 13px;
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
      align-self: flex-start;
      justify-content: flex-start;
      cursor: pointer;
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

      .aui-i-link {
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

.red {
  color: #c72606;
}

</style>
