<template>
  <div :class="headerClasses" :taskId="task.id">
    <div class="aui-i-finish-tag" v-if="task.status === '已完成'">
      <strong>已完成</strong>
    </div>
    <div class="aui-i-header">
      <div>
        <Tag :color="taskColor" @click="onCLickTaskNo" class="aui-i-id">
          {{ task.typeName }}&nbsp;∙&nbsp;{{ taskNo }}
        </Tag>
        <Tag v-if="task.lane" class="aui-i-id">
          {{ task.lane.name }}
        </Tag>
      </div>
    </div>
    <div class="aui-i-body">
      <div class="aui-i-name" @dblclick="onCLickName">
        <p>{{ task.name }}</p>
      </div>
      <div class="aui-i-tags">
        <Badge v-if="show_project && projectName" :text="projectName" status="default"></Badge>
        <Badge class="aui-i-tag-imp"
               :color="importanceColor" :text="`${importanceDesc}(${task.importance})`"></Badge>
        <Badge v-if="task.type === 'BUG'" color="#ed4014" text="BUG"></Badge>
        <Badge v-for="(tag, index) in task.tags" :color="tag.color" :text="tag.name" :key="index"
               class="aui-i-tag"
        />
      </div>
      <div class="aui-i-users">
        <template v-if="assignors.length > 0">
          <Tooltip v-for="assignor in assignors" :key="assignor.id"
                   :content="assignor.nickname" placement="top"
                   style="margin-right: -5px">
            <Avatar
                style="color:#ff9900;background-color: #e8eaec"
                :src="assignor.avatar"
            >{{ assignor.nickname[0] }}
            </Avatar>
          </Tooltip>
        </template>
      </div>
      <div class="aui-i-extra">
        <Space :size="1" split>
          <Icon type="md-quote" v-if="task.hasAttention"
                style="cursor: pointer; font-size: 0.9rem"
                @click="onClickAttention"
          />
          <Icon type="md-paper" v-if="task.hasDesc"/>
          <Tooltip v-if="storySight" placement="top">
            <span>{{ task.sp }}/{{ task.passedSp }}</span>
            <template #content>
              <p>期望故事点：{{ task.sp }}</p>
              <p>实际故事点：{{ task.passedSp }}</p>
            </template>
          </Tooltip>
          <Tooltip v-else placement="top">
            <span>{{
                helper.formatHoursFromSeconds(task.duration)
              }}/{{ helper.formatHoursFromSeconds(task.currLaneDuration) }}</span>
            <template #content>
              <p>任务持续时间：{{ helper.formatHoursFromSeconds(task.duration) }}</p>
              <p>泳道停留时间：{{ helper.formatHoursFromSeconds(task.currLaneDuration) }}</p>
            </template>
          </Tooltip>
          <span @click="onClickLog" style="cursor: pointer">{{ helper.formatTime(task.updatedAt) }}</span>
        </Space>
      </div>
    </div>
  </div>
</template>

<script setup>

import helper from '@/utils/helper'
import TaskService from '@/business/task_service'
import {Avatar, Badge, Copy, Icon, Message, Modal, Space, Tooltip} from 'view-ui-plus'
import {computed, inject} from "vue"
import {useConfigStore, useModalStore, useUserStore} from '@/store'
import {storeToRefs} from "pinia"
import {getImportanceColor, getImportanceDesc} from '@/utils/constant'

const userStore = useUserStore()

const configStore = useConfigStore()
const {prioritySight, storySight} = storeToRefs(configStore)

const modalStore = useModalStore()
const {usersSelectModal, taskModal} = storeToRefs(modalStore)

const actionRight = computed(() => {
  if (props.task.status === '已完成') {
    return '46px'
  } else {
    return '5px'
  }
})

const props = defineProps(['task', 'show_project'])

const project = inject('project')
const projects = inject('projects')

const projectName = computed(() => {
  const targets = projects.value.filter(p => p.id === props.task.projectId)
  if (targets.length > 0) return targets[0].name
  return ''
})

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
  if (prioritySight.value) {
    return importanceColor.value
  } else {
    return taskNameColor.value
  }
})

const assignors = computed(() => {
  return props.task.assignorIds.map(uid => userStore.getUser(uid))
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

let headerClasses = computed(() => {
  if (props.task.flashing) {
    return `aui-task aui-task-type-${props.task.type} animation-flash`
  } else {
    return `aui-task aui-task-type-${props.task.type}`
  }
})

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

const onClickLog = () => {
  modalStore.show('taskLogModal', {
    task: props.task
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
      white-space: normal;
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

      .aui-i-tag-imp {
        &:hover {
          cursor: pointer;
        }
      }

      .aui-i-tag {
        &:hover {
          cursor: pointer;
          margin-left: 1px;
          transition-duration: 0.2s;
          transition-timing-function: cubic-bezier();
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
