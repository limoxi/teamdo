<template>
  <template v-if="loadingTasks">
    <Skeleton
        loading
        animated
        :title="false"
        :paragraph="{ rows: 5, width: ['100%', '100%', '80%', '80%', '20%'] }"
    />
  </template>
  <template v-else>
    <action-bar @search="handleSearch"></action-bar>
    <div class="epics-page" v-if="tasks.length>0">
      <draggable
          class="aui-epic-tasks"
          id="epicTasks"
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
                <span v-if="task.status !== '已放弃'" :class="taskCanDrag? 'aui-a-draggable' : ''">{{ task.name }}</span>
                <span v-else style="text-decoration: line-through;">{{ task.name }}</span>
                <Tooltip :content="task.updatedAt" placement="right">
                  <span style="font-size: 12px">{{ helper.formatTime(task.updatedAt) }}</span>
                </Tooltip>
                <Badge :color="getStatusColor(task.status)" :text="task.status"/>
                <span style="font-weight: bold">{{task.getProgress()}}%&nbsp;&nbsp;&nbsp;&nbsp;</span>
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
                  <span style="font-size: 12px">{{ helper.formatTime(task.expectedFinishedAt) }}</span>
                </Tooltip>
                <a class="aui-i-link" v-if="task.docLink"
                   :href="task.docLink"
                   target="_blank">
                  <img :src="axIcon" style="width: 10px"/>
                  文档链接
                </a>
                <a class="aui-i-link" v-if="task.designLink"
                   :href="task.designLink" target="_blank">
                  <img :src="lhIcon" style="width: 10px;scale: 1.2"/>
                  设计链接
                </a>
              </Space>
            </Space>

            <div class="aui-i-extra">
              <Button size="large" type="text" icon="ios-flame"
                      @click="onSetTop(task)"></Button>
              <Button v-if="task.status !== '已放弃'" size="large" type="text" icon="logo-buffer"
                      @click="onAddRelatedTask(task)"></Button>
              <Button v-if="task.status !== '已放弃'" size="large" type="text" icon="md-create"
                      @click="onEdit(task)"></Button>
              <Button v-if="task.status !== '已放弃'" size="large" type="text" icon="md-trash"
                      @click="onDelete(task)"></Button>
              <Button size="large" type="text" icon="ios-notifications" @click="onClickLog(task)"></Button>
            </div>
          </div>
        </template>
        <div class="aui-i-blank"></div>
      </draggable>
      <Page size="small" v-model="targetPage.curPage" show-total show-sizer
            :page-size-opts="[10, 30, 50, 100]"
            @on-change="onPageChange" @on-page-size-change="onPageSizeChange"
            style="text-align: right; margin:0 5px"
            :total="targetPage.totalCount" :page-size="targetPage.pageSize"/>
    </div>
    <Result v-else type="warning" title="还没有任何需求">
      <template #desc>
        添加一个需求吧~
      </template>
      <template #actions>
        <Button icon="md-add" @click="onAddTask" class="aui-icon-scale">添加需求</Button>
      </template>
    </Result>
  </template>
</template>

<script setup>
import Draggable from 'vuedraggable';
import helper from '@/utils/helper';
import ActionBar from './epics_action_bar'
import {computed, inject, onMounted, ref} from "vue"
import {useModalStore} from '@/store'
import EpicTaskService from '@/business/epic_task_service';
import {getImportanceColor, getImportanceDesc} from '@/utils/constant';
import {Message, Modal, Space} from "view-ui-plus";
import axIcon from '@/assets/images/ax-icon.svg'
import lhIcon from '@/assets/images/lh-icon.svg'

const modalStore = useModalStore()

const projectId = inject('projectId')
const project = inject('project')

const drag = ref(false)
const tasks = ref([])
const loadingTasks = ref(true)
const filters = ref({})
const orderFields = ref(['-display_index'])

const targetPage = ref({
  curPage: 1,
  pageSize: 10,
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

const getStatusColor = (status) => {
  switch (status) {
    case '未开始':
      return '#ff9900'
    case '进行中':
      return '#19be6b'
    case '已完成':
      return '#2b85e4'
    case '已放弃':
      return '#808695'
    default:
      return '#ff9900'
  }
}

const onSetTop = task => {
  EpicTaskService.resortToTop(projectId, task.id).then(() => {
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
  modalStore.show('epicModal', {
    projectId: projectId,
    task: task
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
        Message.error(err.errMsg)
      });
    }
  });
}

const onClickLog = (task) => {
  modalStore.show('taskLogModal', {
    task: task
  })
}

onMounted(() => {
  modalStore.$subscribe((_, state) => {
    const epicModal = state.epicModal
    if (!epicModal.show) {
      loadPagedEpicTasks()
    }
  })
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
      filters.value,
      {
        'with_tags': true,
        'with_users': true,
        'with_children': true
      },
      orderFields.value,
      targetPage.value
  ).then(resp => {
    tasks.value = resp.tasks
    targetPage.value.totalCount = resp.page_info.total_count
    loadingTasks.value = false
  })
}

const onAddTask = () => {
  modalStore.show('epicModal', {
    projectId: projectId
  })
}

</script>

<style scoped lang="less">
.epics-page {
  .ivu-list-item {
    padding: 15px;
  }

  .aui-epic-tasks {
    max-height: calc(100vh - 126px);
    overflow-y: scroll;
    margin: 5px;
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
      border-bottom: 1px solid #ddd;

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
