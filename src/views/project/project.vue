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
  <!-- model -->
  <lane-model
      v-model:show="showLaneModel"
      :projectId="parseInt(projectId)"
      :lane="modelLane"
      :mode="laneModelMode"
  ></lane-model>
  <task-model
      :mode="taskModelMode"
      v-model:show="showTaskModel"
      :projectId="parseInt(projectId)"
      :task="modelTask"
  ></task-model>
  <user-select-model />
  <task-log-model
      v-model:show="showTaskLogModel"
      :task="modelTask"
  ></task-log-model>
</template>

<script setup>
import TopFrame from '@/components/frame/top_frame';
import ProjectHeader from '@/components/frame/header/project_header';
import LaneModel from '@/components/model/lane_model';
import TaskModel from '@/components/model/task_model';
import TaskLogModel from '@/components/model/task_log_model';
import UserSelectModel from '@/components/model/user_select_model';
import ProjectService from '@/service/project_service';
import {events, EventBus} from '@/service/event_bus'
import {ref, provide, onMounted} from 'vue'

const props = defineProps(['projectId', 'name'])
let showTaskModel = ref(false)
let showTaskLogModel = ref(false)
let showLaneModel = ref(false)
let showUserSelectModel = ref(false)
let selectUserInProject = ref(0)
let selectUserInTask = ref(0)
let selectUserMode = ref('')
let taskModelMode = ref('mod')
let laneModelMode = ref('create')
let modelTask = ref(null)
let modelLane = ref({})

const eventBus = new EventBus()
provide('eventBus', eventBus)

onMounted(() => {
  eventBus.on(events.LANE_ADDING, lane => {
    laneModelMode.value = 'create';
    modelLane.value = lane
    showLaneModel.value = true;
  });

  eventBus.on(events.LANE_EDITING, lane => {
    laneModelMode.value = 'mod';
    modelLane.value = lane;
    showLaneModel.value = true;
  });

  eventBus.on(events.TASK_ADDING, () => {
    taskModelMode.value = 'create';
    modelTask.value = {}
    showTaskModel.value = true;
  });

  eventBus.on(events.TASK_EXPANDED, task => {
    taskModelMode.value = 'mod';
    modelTask.value = task;
    showTaskModel.value = true;
  });

  eventBus.on(events.TASK_INSPECTING, task => {
    modelTask.value = task;
    showTaskLogModel.value = true;
  });

  eventBus.on(events.SELECTING_USER, (mode='', projectId=0, taskId=0) => {
    selectUserMode.value = mode
    selectUserInProject.value = projectId
    selectUserInTask.value = taskId
    showUserSelectModel.value = true;
  });

  getProject()
})

let project = ref({
  id: props.projectId,
  name: props.name,
  prefix: 'XXX',
  bots: [],
  users: [],
  tags: []
})

provide('project', project)

const getProject = () => {
  ProjectService.getProject(props.projectId).then(data => {
    project.value.id = data.id
    project.value.name = data.name
    project.value.prefix = data.prefix
    project.value.users = data.users
    project.value.bots = data.bots
    project.value.tags = data.tags
  })
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
