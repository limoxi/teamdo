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
  <task-log-modal/>
  <user-select-modal @onSelect="handleSelectUser"/>
  <users-select-modal @onSelect="handleSelectUsers"/>
  <task-modal @onAdd="handleAddTask" @onUpdate="handleUpdateTask" @onDelete="handleDeleteTask"/>
  <epic-modal @onAdd="handleAddTask" @onUpdate="handleUpdateTask" @onDelete="handleDeleteTask"/>
</template>

<script setup>
import TopFrame from '@/components/frame/top_frame'
import ProjectHeader from '@/components/frame/header/project_header'
import TaskModal from '@/components/modal/task_modal'
import TaskLogModal from '@/components/modal/task_log_modal'
import UserSelectModal from '@/components/modal/user_select_modal'
import UsersSelectModal from '@/components/modal/users_select_modal'
import EpicModal from '@/components/modal/epic_modal'
import {provide, ref} from 'vue'
import ProjectService from "@/business/project_service"
import Project from "@/business/model/project"
import {Message} from "view-ui-plus"
import {useUserStore} from "@/store"

const props = defineProps(['projectId'])
const projectId = parseInt(props.projectId)
provide('projectId', projectId)

const userStore = useUserStore()

const project = ref(new Project({id: projectId}))
await userStore.loadAllUsers()
const projectData = await ProjectService.getProject(projectId)
projectData.users.forEach(user => user.avatar = userStore.getUser(user.id).avatar)
project.value = new Project(projectData)
provide('project', project)

const handleAddTask = (newTask) => {
    project.value.getLaneById(newTask.laneId).addTask(newTask)
}
const handleUpdateTask = (updatedTask) => {
  try{
    project.value.getLaneById(updatedTask.laneId).updateTask(updatedTask)
  } catch (e) {
    console.error(e)

  }

}

const handleDeleteTask = deletedTask => {
    project.value.getLaneById(deletedTask.laneId).removeTask(deletedTask)
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

const handleSelectUsers = (selectedUserIds, action, actionData) => {
    switch (action) {
        case 'selectAssignorsForTask':
            project.value.setTaskAssignors(actionData.laneId, actionData.taskId, selectedUserIds)
            break
        case 'selectManagersForLane':
            project.value.getLaneById(actionData.laneId).setManagers(selectedUserIds)
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
