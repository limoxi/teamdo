<template>
    <div :class="headerClasses" :taskId="task.id">
        <div class="aui-i-finish-tag" v-if="task.status === '已完成'">
            <strong>已完成</strong>
        </div>
        <div class="aui-i-header">
            <div>
                <Checkbox v-model="taskSelected" v-if="mode==='SELECT'"/>
                <Tag :color="taskColor" @click="onCLickTaskNo" class="aui-i-id">
                    {{ task.typeName }}&nbsp;∙&nbsp;{{ taskNo }}
                </Tag>
            </div>
            <div class="aui-i-action">
                <Button v-show="!lane.isFirst" icon="ios-undo" @click="onClickPre"></Button>
                <Button v-show="task.status !== '已完成'" icon="ios-flash" :class="flashClass"
                        @click="onClickFlash"></Button>
                <Button icon="md-qr-scanner" class="aui-icon-scale" @click="onClickEdit"></Button>
                <Button icon="md-filing" class="aui-icon-scale" @click="onAddRelation"></Button>
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
                <Badge v-if="task.type === 'BUG'" color="#ed4014" text="BUG"></Badge>
                <Badge v-for="(tag, index) in task.tags" :color="tag.color" :text="tag.name" :key="index"
                       class="aui-i-tag" @click="onClickTag(tag)"
                />
            </div>
            <div class="aui-i-users" @click="onSelectAssignors">
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
                <template v-else>
                  <Tooltip content="添加执行人" placement="right">
                    <Avatar icon="md-add" style="font-size: 21px"></Avatar>
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
                    <Icon v-if="task.parentId >0" type="md-link" style="cursor: pointer; font-size: 1rem"
                          @click="onClickEdit($event, true)"/>

                    <Tooltip v-if="storySight" placement="top">
                        <span>{{ task.sp }}/{{ task.passedSp }}</span>
                        <template #content>
                            <p>期望故事点：{{ task.sp }}</p>
                            <p>实际故事点：{{ task.passedSp }}</p>
                        </template>
                    </Tooltip>
                    <Tooltip v-else placement="top">
                      <span>{{ helper.formatHoursFromSeconds(task.duration) }}/{{ helper.formatHoursFromSeconds(task.currLaneDuration) }}</span>
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

import helper from '@/utils/helper';
import TaskService from '@/business/task_service';
import EpicTaskService from '@/business/epic_task_service';
import {Avatar, Badge, Button, Checkbox, Copy, Message, Modal, Space, Tooltip} from 'view-ui-plus'
import {computed, inject} from "vue";
import {useConfigStore, useModalStore, useTaskFilterStore, useTaskModeStore} from '@/store'
import {storeToRefs} from "pinia";
import {getImportanceColor, getImportanceDesc} from '@/utils/constant';
import useSystemUsersStore from "@/store/system_users";

const systemUsersStore = useSystemUsersStore()
const {id2user} = storeToRefs(systemUsersStore)

const configStore = useConfigStore()
const {prioritySight, storySight} = storeToRefs(configStore)

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

const actionRight = computed(() => {
    if (props.task.status === '已完成') {
        return '46px'
    } else {
        return '5px'
    }
})

const props = defineProps(['task', 'lane'])
const emit = defineEmits(['onAdd', 'onRemove'])

const project = inject('project')
const lanes = computed(() => {
    return project.value.getLanesByKanbanType(props.lane.kanbanType) || []
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
    return props.task.assignorIds.map(uid => id2user.value[uid])
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
        projectId: project.value.id,
        relatedTask: props.task
    })
}

const onClickEdit = (e, getParent = false) => {
    let targetTaskId = props.task.id
    let getEpicTask = false
    let readonly = false
    let projectId = project.value.id
    if (getParent && props.task.parentCategory === 'epic') {
        getEpicTask = true
        targetTaskId = props.task.parentId
        readonly = true
    }

    if (getEpicTask) {
        EpicTaskService.getEpicTask(projectId, targetTaskId).then(epicTask => {
            modalStore.show('epicModal', {
                projectId: project.value.id,
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
                'projectId': project.value.id,
                'task': nTask,
                'readonly': readonly
            })
        }).catch(err => {
            Message.error(err.errMsg);
        });
    }
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

const onSelectAssignors = () => {
    modalStore.show('usersSelectModal', {
        projectId: project.value.id,
        laneId: props.task.laneId,
        taskId: props.task.id,
        selectedUserIds: props.task.assignorIds,
        action: 'selectAssignorsForTask'
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
