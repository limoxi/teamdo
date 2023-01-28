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
    <div class="epics-page" v-if="tasks.length>0">
      <action-bar @search="handleSearch"></action-bar>
      <List class="aui-i-tasks" size="small" border item-layout="vertical">
        <ListItem
            class="aui-i-task"
            v-for="(task, index) in tasks"
            :key="index"
        >
          <div class="aui-i-sider" :style="{background: getImportanceColor(task.importance)}"></div>

          <Space direction="vertical">
            <Space split>
              <i class="aui-i-id">#{{ task.id }}</i>
              <span v-if="task.status !== '已放弃'">{{ task.name }}</span>
              <span v-else style="text-decoration: line-through;">{{ task.name }}</span>
              <Badge :color="getStatusColor(task.status)" :text="task.status"/>
              <Tooltip :content="task.updatedAt" placement="right">
                <span style="font-size: 12px;color: darkgrey">{{ helper.formatTime(task.updatedAt) }}</span>
              </Tooltip>
            </Space>
            <Space split>
              <Avatar size="small" :src="task.getCreator().avatar"/>
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

          <template #extra>
            <Button v-if="task.status !== '已放弃'" size="large" type="text" icon="logo-buffer"
                    @click="onAddRelatedTask(task)"></Button>
            <Button v-if="task.status !== '已放弃'" size="large" type="text" icon="md-create"
                    @click="onEdit(task)"></Button>
            <Button v-if="task.status !== '已放弃'" size="large" type="text" icon="md-trash"
                    @click="onDelete(task)"></Button>
            <Button size="large" type="text" icon="ios-notifications" @click="onClickLog(task)"></Button>
          </template>
        </ListItem>
      </List>
      <Page size="small" v-model="targetPage.curPage" show-total
            @on-change="onPageChange" style="text-align: right; margin:0 5px"
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
import helper from '@/utils/helper';
import ActionBar from './epics_action_bar'
import {inject, onMounted, ref} from "vue"
import {useModalStore} from '@/store'
import EpicTaskService from '@/business/epic_task_service';
import EpicTask from '@/store/epic';
import {getImportanceColor, getImportanceDesc} from '@/utils/constant';
import {Message, Modal, Space} from "view-ui-plus";
import axIcon from '@/assets/images/ax-icon.svg'
import lhIcon from '@/assets/images/lh-icon.svg'

const modalStore = useModalStore()

const projectId = inject('projectId')
const project = inject('project')

const tasks = ref([])
const loadingTasks = ref(true)
const filters = ref({})
const orderFields = ref([])

const targetPage = ref({
  curPage: 1,
  pageSize: 10,
  totalCount: 0
})

const handleSearch = (f) => {
  filters.value = f
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
        emit('onDelete')
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

const loadPagedEpicTasks = async () => {
  EpicTaskService.getEpicTasks(
      projectId,
      filters.value,
      {
        'with_tags': true,
        'with_users': true
      },
      orderFields.value,
      targetPage.value
  ).then(resp => {
    tasks.value = resp.tasks.map(t => new EpicTask(t))
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

  .aui-i-tasks {
    max-height: calc(100vh - 126px);
    overflow-y: scroll;
    margin: 5px;

    .aui-i-task {
      position: relative;
      align-items: center;

      .aui-i-sider {
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
      }

      &:hover {
        .aui-i-sider {
          width: 5px;
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
