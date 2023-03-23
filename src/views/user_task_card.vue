<template>
  <div :class="headerClasses" :taskId="task.id">
    <div class="aui-i-header">
      <div>
        <Tag :color="taskColor" @click="onCLickTaskNo" class="aui-i-id">
          {{ task.typeName }}&nbsp;∙&nbsp;{{ taskNo }}
        </Tag>
      </div>
      <div class="aui-i-action">
<!--        <Button icon="md-qr-scanner" class="aui-icon-scale" @click="onClickEdit"></Button>-->
        <Dropdown trigger="click" transfer placement="right-start" @on-click="onCLickSwitch">
          <Button icon="md-jet"/>
          <template #list>
            <DropdownMenu>
              <template v-for="l in lanes" :key="l.id">
                <DropdownItem :name="l.id">
                  {{ l.name }}
                </DropdownItem>
              </template>
            </DropdownMenu>
          </template>
        </Dropdown>
      </div>
    </div>
    <div class="aui-i-body">
      <div class="aui-i-name" @dblclick="onCLickName">
        {{ task.name }}
      </div>
      <div class="aui-i-tags">
        <Badge color="#19be6b" :text="task.project.name"></Badge>
        <Badge :color="importanceColor" :text="`${importanceDesc}(${task.importance})`"></Badge>
        <Badge v-if="task.type === 'BUG'" color="#ed4014" text="BUG"></Badge>
        <Badge v-for="(tag, index) in task.tags" :color="tag.color" :text="tag.name" :key="index"
               class="aui-i-tag"
        />
      </div>
      <div class="aui-i-extra">
        <Space :size="4">
          <Icon type="md-quote" v-if="task.hasAttention"
                style="cursor: pointer; font-size: 0.9rem"
                @click="onClickAttention"
          />
          <Icon type="md-paper" v-if="task.hasDesc"/>
          <Icon v-if="task.parentId >0" type="md-link" style="cursor: pointer; font-size: 1rem"
                @click="onClickEdit($event, true)"/>

          <Tooltip placement="top">
            <span>{{ task.sp }}/{{ task.passedSp }}</span>
            <template #content>
              <p>期望故事点：{{ task.sp }}</p>
              <p>实际故事点：{{ task.passedSp }}</p>
            </template>
          </Tooltip>
          <span style="cursor: pointer">{{ helper.formatTime(task.updatedAt) }}</span>
        </Space>
      </div>
    </div>
  </div>
</template>

<script setup>

import helper from '@/utils/helper';
import TaskService from '@/business/task_service';
import EpicTaskService from '@/business/epic_task_service';
import {Badge, Button, Copy, Message, Modal, Space, Tooltip} from 'view-ui-plus'
import {computed} from "vue";
import {useModalStore} from '@/store'
import {storeToRefs} from "pinia";
import {getImportanceColor, getImportanceDesc} from '@/utils/constant';
import LaneService from "../business/lane_service";

const modalStore = useModalStore()
const {taskModal} = storeToRefs(modalStore)

const props = defineProps(['task'])

const project = props.task.project
const lanes = project.lanes

const importanceDesc = computed(() => {
  return getImportanceDesc(props.task.importance)
})

const importanceColor = computed(() => {
  return getImportanceColor(props.task.importance)
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
  return taskNameColor.value
})

const taskNo = `${project.prefix}${props.task.id}`

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

  const t = `${pre}_${project.prefix.toLowerCase()}${props.task.id}`
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

let headerClasses = computed(() => {
  if (props.task.flashing) {
    return `aui-task aui-task-type-${props.task.type} animation-flash`
  } else {
    return `aui-task aui-task-type-${props.task.type}`
  }
})

const onCLickSwitch = (targetLaneId) => {
  switchLane(targetLaneId)
}

const switchLane = (targetLaneId) => {
  LaneService.shuttleTask(project.id, props.task.id, targetLaneId, 0).then(() => {
    Message.success('操作成功')
  }).catch(err => {
    console.error(err)
    Message.error(err.errMsg || '操作失败')
  })
}

const onClickEdit = (e, getParent = false) => {
  let targetTaskId = props.task.id
  let getEpicTask = false
  let readonly = true
  let projectId = project.id
  if (getParent && props.task.parentCategory === 'epic') {
    getEpicTask = true
    targetTaskId = props.task.parentId
  }

  if (getEpicTask) {
    EpicTaskService.getEpicTask(projectId, targetTaskId).then(epicTask => {
      modalStore.show('epicModal', {
        projectId: project.id,
        task: epicTask,
        readonly: readonly
      })
    }).catch(err => {
      console.error(err)
      Message.error(err.errMsg);
    });
  } else {
    TaskService.getTask(projectId, targetTaskId).then(nTask => {
      modalStore.show('taskModal', {
        'projectId': project.id,
        'task': nTask,
        'readonly': readonly
      })
    }).catch(err => {
      Message.error(err.errMsg);
    });
  }
}

const onClickAttention = () => {
  TaskService.getTask(project.id, props.task.id).then(nTask => {
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

const onClickLog = () => {
  modalStore.show('taskLogModal', {
    task: props.task
  })
}

</script>

<style scoped lang="less">
.aui-task {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin: 5px 10px;
  padding: 10px;
  border-radius: 5px;
  overflow: hidden;
  width: 280px;
  border: 1px solid darkgray;
  box-shadow: 1px 2px 8px 0px #808695;

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
    font-size: 14px;
    font-weight: bold;

    .aui-i-action {
      position: absolute;
      top: 10px;
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
