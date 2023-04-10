<template>
    <top-frame>
        <template #header>
            <Header/>
        </template>
        <template #content>
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
                <div class="user-tasks-page" v-if="tasks.length>0">
                    <div class="aui-tasks">
                        <div class="aui-task" v-for="task in tasks"
                             :key="task.id"
                        >
                            <div class="aui-i-sider" :style="{background: getImportanceColor(task.importance)}"></div>

                            <Space direction="vertical">
                                <Space split
                                       class="aui-i-taskTitleBar"
                                       :style="`background: linear-gradient(to right, transparent 25%, ${getStatusColor(task.status)} 150%)`"
                                >
                                    <i class="aui-i-id">#{{ task.id }}</i>
                                    <span>{{ task.name }}</span>
                                    <Tooltip :content="task.updatedAt" placement="right">
                                        <span style="font-size: 12px">{{ helper.formatTime(task.updatedAt) }}</span>
                                    </Tooltip>
                                    <Badge :color="getStatusColor(task.status)" :text="task.status"/>
                                    <span style="font-weight: bold">{{ task.progress }}%&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                </Space>
                                <Space split>
                                    <Tag>{{ task.project.name }}</Tag>
                                    <Badge :color="getImportanceColor(task.importance)"
                                           :text="`${getImportanceDesc(task.importance)}(${task.importance})`"/>
                                </Space>
                            </Space>

                            <div class="aui-i-extra">
                                <Button v-if="!task.isReplica || task.status !== '已放弃'" size="large" type="text"
                                        icon="md-create"
                                        @click="onEdit(task)"></Button>
                                <Button v-if="task.status !== '已放弃'" size="large" type="text" icon="md-trash"
                                        @click="onDelete(task)"></Button>
                                <Button size="large" type="text" icon="ios-notifications"
                                        @click="onClickLog(task)"></Button>
                            </div>
                        </div>
                        <div class="aui-i-blank"></div>
                    </div>
                    <Page size="small" v-model="targetPage.curPage" show-total show-sizer
                          :page-size-opts="[10, 30, 50, 100]"
                          @on-change="onPageChange" @on-page-size-change="onPageSizeChange"
                          style="text-align: right; margin:0 5px"
                          :total="targetPage.totalCount" :page-size="targetPage.pageSize"/>
                </div>
                <Result v-else type="warning" title="还没有任何需求"></Result>
            </template>
        </template>
    </top-frame>
</template>

<script setup>
import TopFrame from '@/components/frame/top_frame';
import Header from '@/components/frame/header/header';
import defaultAvatar from '@/assets/images/default-avatar.webp';
import helper from '@/utils/helper';
import ActionBar from './tasks_action_bar'
import {computed, inject, onMounted, ref, watch} from "vue"
import {useModalStore} from '@/store'
import EpicTaskService from '@/business/epic_task_service';
import {getImportanceColor, getImportanceDesc} from '@/utils/constant';
import {Message, Modal, Space, Tag} from "view-ui-plus";
import TaskService from "@/business/task_service";

const modalStore = useModalStore()

const tasks = ref([])
const loadingTasks = ref(true)
const filters = ref({})
const orderFields = ref(['-updated_at'])

const targetPage = ref({
    curPage: 1,
    maxPage: 1,
    pageSize: 20,
    totalCount: 0
})

const handleSearch = (data) => {
    filters.value = data.filters
    orderFields.value = data.orderFields
    loadPagedTasks()
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

const onEdit = (task) => {
    TaskService.getTask(task.projectId, task.id).then(fullTask => {
        modalStore.show('taskModal', {
            projectId: task.projectId,
            task: fullTask
        })
    })

}

const onDelete = (task) => {
    Modal.confirm({
        title: '删除任务',
        content: '<strong>确定要删除该任务么？</strong><p>删除后该任务及其关联任务将被解除</p>',
        okText: '确认',
        cancelText: '再想想',
        onOk: () => {
            TaskService.deleteTask(task.projectId, task.id).then(() => {
                loadPagedTasks()
            }).catch(err => {
                Message.error(err.errMsg || '操作失败')
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
    loadPagedTasks()
})

const onPageChange = page => {
    loadPagedTasks()
}

const onPageSizeChange = pageSize => {
    targetPage.value.pageSize = pageSize
    loadPagedTasks()
}

const loadPagedTasks = async () => {
    TaskService.getUserTasks(
        filters.value,
        targetPage.value,
        orderFields.value
    ).then(resp => {
        tasks.value = resp.tasks
        targetPage.value.totalCount = resp.pageInfo.total_count
        targetPage.value.maxPage = resp.pageInfo.max_page
        loadingTasks.value = false
    })
}

</script>

<style scoped lang="less">
.user-tasks-page {
  .ivu-list-item {
    padding: 15px;
  }

  .aui-tasks {
    max-height: calc(100vh - 126px);
    overflow-y: scroll;
    margin: 5px;
    border: 1px solid #ddd;
    border-radius: 5px;

    .aui-i-taskTitleBar {
      border-radius: 20px;
    }

    .aui-task {
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
    }
  }
}
</style>
