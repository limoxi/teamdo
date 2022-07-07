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
      @projectCreated="onProjectsUpdated"
      @projectUpdated="onProjectsUpdated"
      :project="null"
      :mode="projectMode"
  ></project-model>
</template>

<script>
import TopFrame from '@/components/frame/top_frame';
import Header from '@/components/frame/header/header';
import ProjectModel from '@/components/model/project_model';
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
    this.getProjects();
  },

  data() {
    return {
      loadingProjects:true,
      projects: [],
      projectMode: 'create',
      editingProject: {},
      showModel: false,
    }
  },
  components: {
    TopFrame,
    ProjectModel,
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

    getProjects() {
      ProjectService.getProjects().then(data => {
        this.projects = data;
        this.loadingProjects = false
      }).catch(err => {
        this.$Message.error(err.errMsg);
      });
    },

    onProjectsUpdated() {
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
