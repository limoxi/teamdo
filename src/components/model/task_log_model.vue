<template>
  <Modal
      style="top:10%"
      v-model="showModal"
      :title="title"
      :footer-hide="true"
  >
    <Timeline>
      <TimelineItem
        v-for="log in logs" :key="log.id"
      >
        <p>
          <Space>
            <span>{{ helper.formatTime(log.created_at) }}</span>
            <span>
              <Tooltip :content="log.actor.nickname">
                <Avatar :src="log.actor.avatar||defaultAvatar" size="small"></Avatar>
              </Tooltip>
              {{ log.actor.nickname }}
            </span>
            <span>{{ log.action }}</span>
            <template v-if="log.from_lane_id===log.to_lane_id && log.to_lane_id>0">
              <span>在 <strong>{{log.to_lane.name}}</strong></span>
            </template>
            <template v-else>
              <span v-if="log.from_lane_id>0">从 <strong>{{log.from_lane.name}}</strong></span>
              <span v-if="log.to_lane_id>0">到 <strong>{{log.to_lane.name}}</strong></span>
            </template>
          </Space>
        </p>
      </TimelineItem>
      <TimelineItem v-if="finished">进行中...</TimelineItem>
    </Timeline>
  </Modal>
</template>

<script setup>

import {ref, computed, inject, watch} from "vue";
import {Message, Space} from "view-ui-plus";
import TaskService from "@/service/task_service";
import defaultAvatar from '@/images/default-avatar.webp';
import helper from '@/utils/helper';

const logs = ref([])
const project = inject('project').value
const props = defineProps(['show', 'task'])
const emit = defineEmits(['update:show'])
const finished = computed(() => {
  if(!!props.task){
    return !['未开始', '进行中'].includes(props.task.status)
  }
  return false
})
const title = computed(() => {
  let title = '任务变动记录'
  if (!!props.task){
    title += `- ${props.task.name}`
  }
  return title
})
let showModal = computed({
  get() {
    return props.show;
  },
  set(newValue) {
    emit('update:show', newValue);
  }
})

watch(props, (newV, oldV) => {
  if (!!newV.task && newV.show){
    TaskService.getTaskLogs(project.id, props.task.id).then(data => {
      logs.value = data
    }).catch(err => {
      Message.error(err.errMsg);
    });
  }
})

const users = computed(() => {
  if (!!props.task){
    return props.task.users
  }
  return []
})

</script>

<style scoped lang="less">

</style>
