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
  <task-log-modal/>
  <user-select-modal/>
</template>

<script setup>
import TopFrame from '@/components/frame/top_frame';
import ProjectHeader from '@/components/frame/header/project_header';
import TaskModal from '@/components/modal/task_modal';
import TaskLogModal from '@/components/modal/task_log_modal';
import UserSelectModal from '@/components/modal/user_select_modal';
import {provide} from 'vue'
import {useProjectStore} from '@/store'
import {Message} from "view-ui-plus"
import {storeToRefs} from "pinia";

const props = defineProps(['projectId'])
const projectStore = useProjectStore()
projectStore.reload(parseInt(props.projectId)).catch(e => {
  Message.error(e.errMsg || '加载项目失败')
})

const {project} = storeToRefs(projectStore)
provide('project', project)

</script>

<style scoped lang="less">
.aui-projects {

  li {
    list-style: none;
    margin: 15px;
  }
}

</style>
