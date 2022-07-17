<template>
  <top-frame>
    <template #header>
      <a-header />
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

<script>
import TopFrame from '@/components/frame/top_frame';
import Header from '@/components/frame/header/header';
import ProjectModel from '@/components/model/project_model';
import BotModal from '@/components/model/bot_model';
import ProjectCard from './project_card';
import ProjectService from '@/service/project_service';
import {events, EventBus} from '@/service/event_bus'
import helper from '@/utils/helper';

export default {
  created() {
    EventBus.on(events.CREATING_PROJECT, ()=>{
      this.addProject()
    })
    EventBus.on(events.EDIT_PROJECT, (project)=>{
      this.editProject(project)
    })
    EventBus.on(events.DELETE_PROJECT, (project)=>{
      this.deleteProject(project)
    })

    EventBus.on(events.ADD_BOT, (project)=>{
      this.addBot(project)
    })
    EventBus.on(events.UPDATE_BOT, (project, bot)=>{
      this.editBot(project, bot)
    })
    EventBus.on(events.DELETE_BOT, ()=>{
      this.getProjects()
    })
    this.getProjects();
  },

  data() {
    return {
      loadingProjects:true,
      projects: [],
      projectMode: 'create',
      botMode: 'create',
      editingProject: null,
      editingBot: 0,
      showModel: false,
      showBotModel: false
    }
  },
  components: {
    TopFrame,
    ProjectModel,
    BotModal,
    ProjectCard,
    'a-header': Header
  },
  methods: {
    addProject() {
      this.projectMode = 'create'
      this.showModel = true
    },

    editProject(project) {
      this.projectMode = 'edit'
      this.editingProject = project
      this.showModel = true
    },

    deleteProject(project){
      ProjectService.deleteProject(project.id).then(() => {
        helper.removeFromArray(project, this.projects, 'id');
      }).catch(err => {
        this.$Message.error(err.errMsg);
      });
    },

    addBot(project) {
      this.botMode = 'create'
      this.editingProject = project
      this.showBotModel = true
    },

    editBot(project, bot) {
      this.botMode = 'edit'
      this.editingProject = project
      this.editingBot = bot
      this.showBotModel = true
    },

    getProjects() {
      ProjectService.getProjects().then(data => {
        this.projects = data;
        this.loadingProjects = false
      }).catch(err => {
        this.$Message.error(err.errMsg);
      });
    },

    onProjectUpdated() {
      this.getProjects();
    }
  }
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
