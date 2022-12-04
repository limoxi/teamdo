<template>
  <top-frame>
    <template #header>
      <project-header/>
    </template>
    <template #content>
      <router-view></router-view>
    </template>
  </top-frame>
  <!-- modal -->
  <task-modal/>
  <epic-modal/>
  <task-log-modal/>
  <user-select-modal/>
</template>

<script setup>
import TopFrame from '@/components/frame/top_frame';
import ProjectHeader from '@/components/frame/header/project_header';
import TaskModal from '@/components/modal/task_modal';
import EpicModal from '@/components/modal/epic_modal';
import TaskLogModal from '@/components/modal/task_log_modal';
import UserSelectModal from '@/components/modal/user_select_modal';
import {provide, ref} from 'vue'
import ProjectService from "@/service/project_service";
import Project from "@/store/project"

const props = defineProps(['projectId'])
const projectId = parseInt(props.projectId)
provide('projectId', projectId)

const project = ref(new Project())
provide('project', project)

ProjectService.getProject(projectId).then(data => {
  project.value = new Project(data)
})

</script>

<style scoped lang="less">
.aui-projects {

  li {
    list-style: none;
    margin: 15px;
  }
}

</style>
