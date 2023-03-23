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
        <draggable
            class="aui-user-tasks"
            v-model="tasks"
            item-key="id"
            :animation="200"
            group="user_task"
            :disabled="false"
            ghostClass="ghost"
            chosenClass="chosen"
            handle=".aui-user-tasks > .aui-task > .aui-i-body"
            @start="drag = true"
            @end="drag = false"
            @sort="onListChange"
        >
          <template #item="{_, index}" :key="index">
            <user-task-card
                v-model:task="tasks[index]"
                :key="index"
            ></user-task-card>
          </template>
        </draggable>
      </template>
    </template>
  </top-frame>
</template>

<script setup>
import TopFrame from '@/components/frame/top_frame';
import Header from '@/components/frame/header/header';
import {onMounted, ref} from "vue"
import Draggable from 'vuedraggable';
import {useModalStore} from '@/store'
import TaskService from '@/business/task_service';
import UserTaskCard from './user_task_card.vue'
import {Message} from "view-ui-plus";

const modalStore = useModalStore()

const tasks = ref([])
const loadingTasks = ref(true)
const filters = ref({})
const orderFields = ref(['-assignor_display_index'])

const targetPage = ref({
  curPage: 1,
  maxPage: 1,
  pageSize: 10,
  totalCount: 0
})

onMounted(() => {
  loadUserTasks()
})

const onPageChange = page => {
  loadUserTasks()
}

const onPageSizeChange = pageSize => {
  targetPage.value.pageSize = pageSize
  loadUserTasks()
}

const loadUserTasks = async () => {
  TaskService.getUserTasks(
      filters.value,
      {
        'with_tags': true,
        'with_project': true,
      },
      orderFields.value,
      targetPage.value
  ).then(resp => {
    tasks.value = resp.tasks
    targetPage.value.totalCount = resp.pageInfo.total_count
    targetPage.value.maxPage = resp.pageInfo.max_page
    loadingTasks.value = false
  })
}

const onListChange = (event) => {
  let taskId = event.item.getAttribute('taskId')
  const targetTasks = [...event.to.children]
  let beforeTaskId
  targetTasks.forEach((el, index) => {
    if (el.getAttribute('taskId') === taskId) {
      if (index < targetTasks.length - 1) {
        beforeTaskId = parseInt(targetTasks[index + 1].getAttribute('taskId'))
      }
    }
  })

  TaskService.resortUserTask(parseInt(taskId), beforeTaskId).catch(err => {
    console.error(err)
    Message.error(err.errMsg || '操作失败')
  })
}

</script>

<style scoped lang="less">
.aui-user-tasks {
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  align-content: flex-start;
  height: calc(100vh - 80px);
}
</style>
