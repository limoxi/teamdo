<template>
  <top-frame>
    <template #header>
      <project-header
          :project="project"
      ></project-header>
    </template>
    <template #content>
      <router-view></router-view>
    </template>
  </top-frame>
  <!-- modal -->
  <task-modal @taskUpdated="onTaskUpdated"/>
  <task-log-modal />
  <user-select-modal />
</template>

<script setup>
import TopFrame from '@/components/frame/top_frame';
import ProjectHeader from '@/components/frame/header/project_header';
import TaskModal from '@/components/modal/task_modal';
import TaskLogModal from '@/components/modal/task_log_modal';
import UserSelectModal from '@/components/modal/user_select_modal';
import ProjectService from '@/service/project_service';
import {events, EventBus} from '@/service/event_bus'
import {ref, provide, onMounted} from 'vue'

const props = defineProps(['projectId', 'name'])

const eventBus = new EventBus()
provide('eventBus', eventBus)

onMounted(() => {
  getProject()
})

let project = ref({
  id: parseInt(props.projectId),
  name: props.name,
  prefix: 'XXX',
  bots: [],
  users: [],
  tags: []
})

provide('project', project)

const getProject = () => {
  ProjectService.getProject(project.value.id).then(data => {
    project.value.id = data.id
    project.value.name = data.name
    project.value.prefix = data.prefix
    project.value.users = data.users
    project.value.bots = data.bots
    project.value.tags = data.tags
  })
}

const onTaskUpdated = (taskId, laneId) => {
  eventBus.emit(events.TASK_UPDATED, taskId, laneId)
}

</script>

<style scoped lang="less">
.aui-projects {

  li {
    list-style: none;
    margin: 15px;
  }
}

</style>
