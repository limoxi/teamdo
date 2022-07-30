<template>
  <top-frame>
    <template #header>
      <Header />
    </template>
    <template #content>
      <template v-if="loadingProjects">
        <Skeleton
            loading
            animated
            :title="false"
            :paragraph="{ rows: 5, width: ['100%', '80%', '60%', '40%', '20%'] }"
        />
      </template>
      <template v-else>
        <ul class="aui-projects" v-if="projects.length > 0">
          <li v-for="project in projects" :key="project.id">
            <project-card :project="project"></project-card>
          </li>
        </ul>
        <Result v-else type="warning" title="还没有任何项目">
          <template #desc>
            新建一个项目吧~
          </template>
          <template #actions>
            <Button icon="md-add" @click="addProject" class="aui-icon-scale">添加项目</Button>
          </template>
        </Result>
      </template>
    </template>
  </top-frame>
  <project-model
      v-model:show="showModel"
      @projectCreated="onProjectUpdated"
      @projectUpdated="onProjectUpdated"
      :project="editingProject"
      :mode="projectMode"
  ></project-model>
  <bot-modal
      v-model:show="showBotModel"
      @onSuccess="onProjectUpdated"
      @onDelete="onProjectUpdated"
      :projectId="editingProject ? editingProject.id : 0"
      :mode="botMode"
      :bot="editingBot"
  ></bot-modal>
</template>

<script setup>
import TopFrame from '@/components/frame/top_frame';
import Header from '@/components/frame/header/header';
import ProjectModel from '@/components/model/project_model';
import BotModal from '@/components/model/bot_model';
import ProjectCard from './project_card';
import ProjectService from '@/service/project_service';
import {events, EventBus} from '@/service/event_bus'
import helper from '@/utils/helper';
import {ref, onMounted, provide} from "vue";
import {Message} from "view-ui-plus";
const eventBus = new EventBus()
provide('eventBus', eventBus)

onMounted(() => {
  eventBus.on(events.CREATING_PROJECT, ()=>{
    addProject()
  })
  eventBus.on(events.EDIT_PROJECT, (project)=>{
    editProject(project)
  })
  eventBus.on(events.DELETE_PROJECT, (project)=>{
    deleteProject(project)
  })

  eventBus.on(events.ADD_BOT, (project)=>{
    addBot(project)
  })
  eventBus.on(events.UPDATE_BOT, (project, bot)=>{
    editBot(project, bot)
  })
  eventBus.on(events.DELETE_BOT, ()=>{
    getProjects()
  })
  getProjects()
})

let loadingProjects = ref(true)
let projects = ref([])
let projectMode = ref('create')
let botMode = ref('create')
let editingProject = ref(null)
let editingBot = ref(0)
let showModel = ref(false)
let showBotModel = ref(false)

const addProject = () => {
  projectMode.value = 'create'
  showModel.value = true
}

const editProject = (project) => {
  projectMode.value = 'edit'
  editingProject.value = project
  showModel.value = true
}

const deleteProject = (project) => {
  ProjectService.deleteProject(project.id).then(() => {
    helper.removeFromArray(project, projects.value, 'id')
  }).catch(err => {
    Message.error(err.errMsg)
  });
}

const addBot = (project) => {
  botMode.value = 'create'
  editingProject.value = project
  showBotModel.value = true
}

const editBot = (project, bot) =>  {
  botMode.value = 'edit'
  editingProject.value = project
  editingBot.value = bot
  showBotModel.value = true
}

const getProjects = () => {
  ProjectService.getProjects().then(data => {
    projects.value = data;
    loadingProjects.value = false
  }).catch(err => {
    Message.error(err.errMsg)
  });
}

const onProjectUpdated = () => {
  getProjects()
}

</script>

<style lang="less" scoped>
.aui-projects {

  li {
    list-style: none;
    margin: 15px;
  }
}

</style>
