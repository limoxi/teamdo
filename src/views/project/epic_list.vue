<template>
    <div class="epics-page">
        <draggable
                class="aui-epic-tasks"
                id="epicTasks"
                v-if="tasks.length > 0"
                v-model="tasks"
                item-key="id"
                :animation="200"
                :disabled="false"
                ghostClass="ghost"
                chosenClass="chosen"
                handle=".aui-epic-tasks > .aui-epic-task .aui-a-draggable"
                @start="drag = true"
                @end="drag = false"
                @sort="onListChange"
        >
            <template #item="{element:task, index}">
                <div :class="`aui-epic-task ${getLimitLineClass(index)}`"
                     :key="index"
                     :taskId="task.id">
                    <div class="aui-i-sider" :style="{background: getImportanceColor(task.importance)}"></div>

                    <Space direction="vertical">
                        <Space split
                               class="aui-i-taskTitleBar"
                               :style="`background: linear-gradient(to right, transparent 25%, ${getStatusColor(task.status)} 150%)`"
                        >
                            <i class="aui-i-id">#{{ task.id }}</i>
                            <span :style="`text-decoration: ${task.status === '已放弃'?'line-through': 'none'};`"
                                  :class="taskCanDrag? 'aui-a-draggable' : ''">{{ task.name }}</span>
                            <Tooltip :content="task.updatedAt" placement="right">
                                <span style="font-size: 12px">{{ helper.formatTime(task.updatedAt) }}</span>
                            </Tooltip>
                            <Badge :color="getStatusColor(task.status)" :text="task.status"/>
                            <span v-if="task.children.length === 0" style="font-weight: bold">{{ task.progress }}%&nbsp;&nbsp;&nbsp;&nbsp;</span>
                            <Poptip trigger="hover" v-else placement="right" transfer>
                                <span style="font-weight: bold">{{ task.progress }}%&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                <template #title>
                                    <p style="font-size: 12px">关联任务数: <b>{{ task.children.length }}</b></p>
                                </template>
                                <template #content>
                                    <div class="aui-children-progress">
                                        <Progress v-for="child in task.children" :key="child.id"
                                                  :percent="child.progress"
                                                  :stroke-width="10"
                                                  :stroke-color="getStatusColor(child.status)"
                                        >
                                            <space>
                                                <b>{{ child.progress }}%</b>
                                                <Avatar size="small" style="margin-right: -15px"
                                                        v-for="childAssignorId in child.assignorIds"
                                                        :src="project.getUser(childAssignorId)?.avatar || defaultAvatar"/>
                                                <b style="scale: 0.5; margin-left: 10px">{{
                                                    project.getLane(child.laneId, KANBAN_TYPE_KANBAN).name
                                                    }}(#{{ child.id }})</b>
                                            </space>
                                        </Progress>
                                    </div>
                                </template>
                            </Poptip>
                        </Space>
                        <Space split>
                            <Tooltip :content="task.getCreator().nickname" placement="right">
                                <Avatar size="small" :src="task.getCreator().avatar"/>
                            </Tooltip>
                            <Badge color="#19be6b" :text="task.fromWhere"/>
                            <Badge :color="getImportanceColor(task.importance)"
                                   :text="`${getImportanceDesc(task.importance)}(${task.importance})`"/>
                            <Tooltip v-if="task.expectedFinishedAt"
                                     :content="`截止于 ${task.expectedFinishedAt}`"
                                     placement="right">
                                <Icon style="font-size: 14px" type="md-alarm"/>
                                <span style="font-size: 12px">{{
                                    helper.formatTime(task.expectedFinishedAt)
                                    }}</span>
                            </Tooltip>
                            <a class="aui-i-link" v-if="task.docLink"
                               :href="task.docLink"
                               target="_blank">
                                <img :src="axIcon" alt="docLink" style="width: 10px"/>
                                文档链接
                            </a>
                            <a class="aui-i-link" v-if="task.designLink"
                               :href="task.designLink" target="_blank">
                                <img :src="lhIcon" style="width: 10px;scale: 1.2" alt="desgLink"/>
                                设计链接
                            </a>
                        </Space>
                    </Space>

                    <div class="aui-i-extra">
                        <Button size="large" type="text" icon="md-trending-up"
                                v-if="taskCanDrag && (targetPage.curPage!==1 || index!==0)"
                                class="bolder-icon"
                                @click="onSetTop(task)"></Button>
                        <Button size="large" type="text" icon="md-add-circle"
                                @click="onAddEpicBefore(index)"></Button>
                        <Button v-if="task.status !== '已放弃'" size="large" type="text" icon="logo-buffer"
                                @click="onAddRelatedTask(task)"></Button>
                        <Button v-if="!task.isReplica || task.status !== '已放弃'" size="large" type="text"
                                icon="md-create"
                                @click="onEdit(task)"></Button>
                        <Button v-if="task.status !== '已放弃'" size="large" type="text" icon="md-trash"
                                @click="onDelete(task)"></Button>
                        <Button size="large" type="text" icon="md-trending-down"
                                v-if="taskCanDrag && (targetPage.curPage!==targetPage.maxPage || index<tasks.length-1)"
                                class="bolder-icon"
                                @click="onSetBottom(task)"></Button>
                        <Button v-if="!task.isReplica" size="large" type="text" icon="md-share"
                                @click="onClickShare(task)"></Button>
                        <Button size="large" type="text" icon="ios-notifications"
                                @click="onClickLog(task)"></Button>
                    </div>
                </div>
            </template>
            <div class="aui-i-blank"></div>
        </draggable>
        <Page size="small" v-model="targetPage.curPage" show-total show-sizer
              :page-size-opts="[10, 30, 50, 100]"
              @on-change="onPageChange" @on-page-size-change="onPageSizeChange"
              style="text-align: right; margin:5px"
              :total="targetPage.totalCount" :page-size="targetPage.pageSize"/>
    </div>
    <project-select-modal @onSelect="handleSelectProject"></project-select-modal>
</template>

<script setup>
import defaultAvatar from '@/assets/images/default-avatar.webp'
import Draggable from 'vuedraggable'
import helper from '@/utils/helper'
import {computed, inject, onMounted, ref, watch} from 'vue'
import {useModalStore} from '@/store'
import EpicTaskService from '@/business/epic_task_service'
import {getImportanceColor, getImportanceDesc, getStatusColor} from '@/utils/constant'
import {Avatar, Badge, Icon, Message, Modal, Page, Poptip, Space, Tooltip} from 'view-ui-plus'
import axIcon from '@/assets/images/ax-icon.svg'
import lhIcon from '@/assets/images/lh-icon.svg'
import ProjectSelectModal from '@/components/modal/project_select_modal'
import TaskService from '@/business/task_service'
import {KANBAN_TYPE_KANBAN} from '@/business/model/constant'

const modalStore = useModalStore()

const projectId = inject('projectId')
const project = inject('project')

const props = defineProps(['lane'])
const currLaneId = props.lane.id

watch(() => project.value.needReloadEpics, (newV, oldV) => {
    if (newV) {
        loadPagedEpicTasks()
    }
}, {deep: true})

const drag = ref(false)
const tasks = ref([])
const filters = ref({})
const orderFields = ref(['-display_index'])

const targetPage = ref({
    curPage: 1,
    maxPage: 1,
    pageSize: 30,
    totalCount: 0
})

// taskCanDrag 只有在自然排序模式下才可以自由拖拽排序
const taskCanDrag = computed(() => {
    return orderFields.value.join(',').includes('display_index')
})

const handleSearch = (data) => {
    filters.value = data.filters
    orderFields.value = data.orderFields
    loadPagedEpicTasks()
}

const onListChange = (event) => {
    const taskId = event.item.getAttribute('taskId')
    const targetTasks = [...event.to.children]
    let beforeTaskId
    targetTasks.forEach((el, index) => {
        if (el.getAttribute('taskId') === taskId) {
            if (index < targetTasks.length - 1) {
                beforeTaskId = targetTasks[index + 1].getAttribute('taskId')
            }
        }
    })
    EpicTaskService.resort(project.value.id, parseInt(taskId), parseInt(beforeTaskId))
}

const getLimitLineClass = (index) => {
    if (targetPage.value.curPage !== 1) {
        return ''
    }
    if (index === 5) {
        return 'aui-i-limitLine'
    }
    return ''
}

const onAddEpicBefore = (beforeIndex) => {
    let beforeTaskId = 0
    if (beforeIndex >= 0) {
        const beforeTask = tasks.value[beforeIndex]
        if (beforeTask) {
            beforeTaskId = beforeTask.id
        }
    }
    modalStore.show('epicModal', {
        projectId: projectId,
        beforeTaskId: beforeTaskId
    })
}

const onSetTop = task => {
    EpicTaskService.resortToTop(projectId, task.id).then(() => {
        loadPagedEpicTasks()
    }).catch(err => {
        Message.error(err.errMsg)
    });
}

const onSetBottom = task => {
    EpicTaskService.resortToBottom(projectId, task.id).then(() => {
        loadPagedEpicTasks()
    }).catch(err => {
        Message.error(err.errMsg)
    });
}

const onAddRelatedTask = (task) => {
    modalStore.show('taskModal', {
        projectId: projectId,
        relatedTask: task
    })
}

const onEdit = (task) => {
    EpicTaskService.getEpicTask(projectId, task.id).then(fullTask => {
        modalStore.show('epicModal', {
            projectId: projectId,
            task: fullTask
        })
    })

}

const onDelete = (task) => {
    Modal.confirm({
        title: '删除需求',
        content: '<strong>确定要删除该需求么？</strong><p>删除后该需求和任务的关联将被解除</p>',
        okText: '确认',
        cancelText: '再想想',
        onOk: () => {
            EpicTaskService.deleteEpicTask(projectId, task.id).then(() => {
                loadPagedEpicTasks()
            }).catch(err => {
                Message.error(err.errMsg || '操作失败')
            });
        }
    });
}

const handleSelectProject = (selectedProjectId, action) => {
    if (!sharingTask.value || !selectedProjectId) {
        return
    }
    TaskService.shareTaskToProject(projectId, sharingTask.value.id, selectedProjectId).then(() => {
        Message.success('操作成功')
        sharingTask.value = null
    }).catch(e => {
        Message.error(e.errMsg || '操作失败')
    })
}

const sharingTask = ref(null)
const onClickShare = task => {
    sharingTask.value = task
    modalStore.show('projectSelectModal')
}

const onClickLog = (task) => {
    modalStore.show('taskLogModal', {
        task: task
    })
}

onMounted(() => {
    loadPagedEpicTasks()
})

const onPageChange = page => {
    loadPagedEpicTasks()
}

const onPageSizeChange = pageSize => {
    targetPage.value.pageSize = pageSize
    loadPagedEpicTasks()
}

const loadPagedEpicTasks = async () => {
    EpicTaskService.getEpicTasks(
        projectId,
      currLaneId,
        filters.value,
        {
            'with_tags': true,
            'with_users': true,
            'with_children': true,
            'with_progress': true
        },
        orderFields.value,
        targetPage.value
    ).then(resp => {
        tasks.value = resp.tasks
        targetPage.value.totalCount = resp.page_info.total_count
        targetPage.value.maxPage = resp.page_info.max_page
    })
}

const onAddTask = () => {
    modalStore.show('epicModal', {
        projectId: projectId
    })
}

</script>

<style lang="less">
.aui-children-progress {
  width: 280px;
  max-height: 100px;
  display: grid;

  .ivu-progress {
    width: 150px;
  }
}
</style>

<style scoped lang="less">
.epics-page {
  .ivu-list-item {
    padding: 15px;
  }

  .aui-epic-tasks {
    max-height: calc(100vh - 126px);
    overflow-y: scroll;
    border: 1px solid #ddd;
    border-radius: 5px;

    .aui-i-taskTitleBar {
      border-radius: 20px;
    }

    .aui-i-limitLine {
      border-bottom: 2px dashed darkred !important;
    }

    .aui-epic-task {
      position: relative;
      align-items: center;
      display: flex;
      justify-content: space-between;
      padding: 10px 15px;
      border-bottom: 1px solid transparent;

      .aui-i-sider {
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
      }

      .aui-i-extra {
        visibility: hidden;
      }

      &:hover {
        .aui-i-sider {
          width: 5px;
        }

        .aui-i-extra {
          visibility: visible;
        }
      }

      .aui-i-link {
        cursor: pointer;
        vertical-align: middle;
        font-size: 12px;
      }
    }
  }
}
</style>

<style scoped lang="less">
.aui-theme-dark {
  .aui-epic-tasks{
    border-color: #333;
    .aui-epic-task{
      border-bottom-color: #444;
    }
  }
}
</style>
