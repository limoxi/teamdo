<template>
  <Modal
      style="top:10%"
      v-model="taskLogModal.show"
      :title="title"
      :footer-hide="true"
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
      <div style="margin-bottom: 20px">
        <Space split>
          <span>参与人({{ users.length }})</span>
          <span>
            <Tooltip :content="user.nickname" v-for="user in users" :key="user.id" style="margin: 0 2px">
            <Avatar :src="user.avatar||defaultAvatar" size="small"></Avatar>
          </Tooltip>
          </span>
        </Space>
      </div>
      <Timeline>
        <TimelineItem
            v-for="log in logs" :key="log.id"
        >
          <template v-if="['完成了任务', '开始了任务'].includes(log.action)" #dot>
            <span v-if="log.action==='完成了任务'" class="aui-i-dot">🎉</span>
            <span v-else-if="log.action==='开始了任务'" class="aui-i-dot">🚌</span>
          </template>
          <template v-else-if="log.action.startsWith('回退')" #dot>
            <span class="aui-i-dot">😩</span>
          </template>
          <template v-else-if="log.action.startsWith('修改了任务')" #dot>
            <span class="aui-i-dot">📝</span>
          </template>
          <p>
            <Space>
              <span>{{ helper.formatTime(log.created_at) }}</span>
              <span>
              <Tooltip :content="log.actor.nickname">
                <Avatar :src="log.actor.avatar||defaultAvatar" size="small"></Avatar>
              </Tooltip>
              {{ log.actor.nickname }}
            </span>
              <span>{{ parseAction(log, log.action) }}</span>
              <template v-if="log.from_lane_id===log.to_lane_id && log.to_lane_id>0">
                <span>在 <strong>{{ log.to_lane.name }}</strong></span>
              </template>
              <template v-else>
                <span v-if="log.from_lane_id>0">从 <strong>{{ log.from_lane.name }}</strong></span>
                <span v-if="log.to_lane_id>0">到 <strong>{{ log.to_lane.name }}</strong></span>
              </template>
            </Space>
          </p>
        </TimelineItem>
        <TimelineItem v-if="!finished">进行中...</TimelineItem>
      </Timeline>
    </template>
  </Modal>
</template>

<script setup>
import {computed, inject, ref} from "vue";
import {Message, Space} from "view-ui-plus";
import TaskService from "@/service/task_service";
import defaultAvatar from '@/images/default-avatar.webp';
import helper from '@/utils/helper';
import {useModalStore} from "@/store"
import {storeToRefs} from "pinia";

const modalStore = useModalStore()
const {taskLogModal} = storeToRefs(modalStore)

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
    TaskService.getTaskLogs(project.value.id, store.task.id).then(data => {
      logs.value = data
      loading.value = false
    }).catch(err => {
      Message.error(err.errMsg);
    });
  }
})

const users = computed(() => {
  return taskLogModal.value.task?.users || []
})

const parseAction = (log, actionText) => {
  let nameRp = '描述'
  switch (log.type) {
    case 'REQ':
      nameRp = '用户故事'
      break
    case 'BUG':
      nameRp = '问题描述'
      break
    case 'OPT':
      nameRp = '优化概要'
      break
  }
  actionText = actionText.replaceAll('name', nameRp)
  actionText = actionText.replaceAll('type', '类型')
  actionText = actionText.replaceAll('desc', '详细描述')
  actionText = actionText.replaceAll('importance', '优先级')
  actionText = actionText.replaceAll('sp', '故事点')
  actionText = actionText.replaceAll('assignor_id', '执行者')
  return actionText
}

</script>

<style scoped lang="less">
.aui-i-dot {
  font-size: 18px;
  vertical-align: -webkit-baseline-middle;
}
</style>
