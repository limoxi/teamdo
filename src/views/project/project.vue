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
  <task-modal @onAdd="handleAddTask" @onUpdate="handleUpdateTask"/>
  <task-log-modal/>
  <user-select-modal @onSelect="handleSelectUser"/>
</template>

<script setup>
import TopFrame from '@/components/frame/top_frame';
import ProjectHeader from '@/components/frame/header/project_header';
import TaskModal from '@/components/modal/task_modal';
import TaskLogModal from '@/components/modal/task_log_modal';
import UserSelectModal from '@/components/modal/user_select_modal';
import {provide, ref} from 'vue'
import ProjectService from "@/business/project_service";
import Project from "@/business/model/project"
import {Message} from "view-ui-plus";

const props = defineProps(['projectId'])
const projectId = parseInt(props.projectId)
provide('projectId', projectId)

const project = ref(new Project({id: projectId}))
provide('project', project)

ProjectService.getProject(projectId).then(data => {
  project.value = new Project(data)
})

const handleAddTask = (newTask) => {
  project.value.getLane(newTask.laneId).addTask(newTask)
}
const handleUpdateTask = (updatedTask) => {
  project.value.getLane(updatedTask.laneId).updateTask(updatedTask)
}
const handleSelectUser = (selectedUserId, action, actionData) => {
  switch (action) {
    case 'selectAssignorForTask':
      project.value.setTaskAssignor(actionData.laneId, actionData.taskId, selectedUserId)
      break
    case 'addProjectMember':
      project.value.addUser(selectedUserId).then(() => {
        Message.success('添加成员成功，正在刷新...');
      }).catch(err => {
        console.error(err)
        Message.error(err.errMsg || '添加成员失败');
      })
      break
  }
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
