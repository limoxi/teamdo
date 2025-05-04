<template>
  <Modal
      style="top:8%"
      width="50%"
      v-model="taskLogModal.show"
      :title="title"
      :footer-hide="true"
      class="aui-task-log-modal"
  >
    <template v-if="loading">
      <Skeleton class="aui-i-skeleton"
                loading
                animated
                :title="false"
                :paragraph="{ rows: 4, width: ['80%', '80%', '60%', '60%'] }"
      />
    </template>
    <template v-else>
      <div v-if="taskLogModal.task.category !== 'epic'" style="margin-bottom: 20px">
        <Space split>
          <span>参与人({{ users.length }})</span>
          <span>
            <Tooltip :content="user.nickname" v-for="user in users" :key="user.id" style="margin: 0 2px">
            <Avatar :src="userStore.getUser(user.id)?.avatar ?? defaultAvatar" size="small"></Avatar>
          </Tooltip>
          </span>
        </Space>
      </div>
      <Timeline>
        <TimelineItem
            v-for="log in logs" :key="log.id"
        >
          <template v-if="['finish', 'start'].includes(log.action)" #dot>
            <span v-if="log.action==='finish'" class="aui-i-dot">🎉</span>
            <span v-else-if="log.action==='start'" class="aui-i-dot">🚌</span>
          </template>
          <template v-else-if="log.action === 'switch_lane'" #dot>
            <span v-if="log.getLaneSwitchDirection() === 'backward'" class="aui-i-dot">😩</span>
            <span v-else-if="log.getLaneSwitchDirection() === 'forward'">🏊</span>
          </template>
          <template v-else-if="log.action === 'update'" #dot>
            <span class="aui-i-dot">🖌️</span>
          </template>
          <p>
            <Space>
              <span>{{ helper.formatTime(log.createdAt) }}</span>
              <span>
                <Tooltip :content="userStore.getUser(log.operatorId).nickname">
                  <Avatar class="aui-avatar-alter" :src="userStore.getUser(log.operatorId).avatar" size="small">
                    {{ userStore.getUser(log.operatorId).nickname[0] }}
                  </Avatar>
                </Tooltip>
              </span>
              <span>{{ log.getActionText() }}</span>
              <template v-if="log.fromLaneId===log.toLaneId && log.toLaneId>0">
                <span>@ <strong>{{ log.toLane.name }}</strong></span>
              </template>
              <template v-else-if="log.fromLaneId>0 && log.toLaneId===0">
                <span>@ <strong>{{ log.fromLane.name }}</strong></span>
              </template>
              <template v-else>
                <span v-if="log.fromLaneId>0"><strong>{{ log.fromLane.name }}</strong></span>
                <span v-else-if="log.fromLaneId===0 && log.toLaneId===0"></span>
                <span v-else><i>任务池</i></span>
                <span v-if="log.toLaneId>0">➡️ <strong>{{ log.toLane.name }}</strong></span>
              </template>
            </Space>
          </p>
        </TimelineItem>
        <TimelineItem v-if="!finished">未完待续...</TimelineItem>
      </Timeline>
    </template>
  </Modal>
</template>

<script setup>
import {computed, inject, ref} from "vue";
import {Avatar, Message, Modal, Skeleton, Space, Timeline, TimelineItem, Tooltip} from 'view-ui-plus'
import TaskService from "@/business/task_service";
import defaultAvatar from '@/assets/images/default-avatar.webp';
import helper from '@/utils/helper';
import {useModalStore, useUserStore} from "@/store"
import {storeToRefs} from "pinia";

const modalStore = useModalStore()
const {taskLogModal} = storeToRefs(modalStore)

const userStore = useUserStore()

const logs = ref([])
const loading = ref(true)
const project = inject('project')

const finished = computed(() => {
  if (!!taskLogModal.value.task) {
    return !['未开始', '进行中'].includes(taskLogModal.value.task.status)
  }
  return false
})
const title = computed(() => {
  let title = '任务变动记录'
  if (!!taskLogModal.value.task) {
    title += `- ${taskLogModal.value.task.name}`
  }
  return title
})

modalStore.$subscribe((_, state) => {
  const store = state.taskLogModal
  if (store.show) {
    loading.value = true
    TaskService.getTaskLogs(project.value.id, store.task.id).then(taskActionLogs => {
      logs.value = taskActionLogs
      loading.value = false
    }).catch(err => {
      Message.error(err.message);
    });
  }
})

const users = computed(() => {
  return taskLogModal.value.task?.users || []
})

</script>

<style lang="less">
.aui-task-log-modal {
  .ivu-modal-header {
    position: sticky;
    top: 0;
    background: white;
    z-index: 1;
    border-radius: 10px 10px 0 0;
  }

  .aui-i-dot {
    font-size: 18px;
    vertical-align: -webkit-baseline-middle;
  }
}
</style>
