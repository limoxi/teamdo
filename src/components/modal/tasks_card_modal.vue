<template>
  <Modal
    sticky
    :mask="false"
    :footer-hide="true"
    :title="title"
    v-model="showModal"
    width="300"
    @on-cancel="onCancel"
    class-name="tasks_card_modal"
  >
    <div class="aui-i-tasks">
      <SimpleTaskCard
          v-for="task in tasks"
          :task="task"
      ></SimpleTaskCard>
    </div>
  </Modal>
</template>

<script setup>
import {ref} from 'vue'
import { Modal} from 'view-ui-plus'
import SimpleTaskCard from '@/components/simple_task_card.vue'
import TaskService from "@/business/task_service";

const tasks = ref([])
const title = ref('')

const showModal = ref(false)

const onCancel = () => {
  tasks.value = []
}

const show = (t, projectId, taskIds=undefined) => {
  if (!taskIds) return
  TaskService.getTasksByIdsInProject(projectId, taskIds).then(respTasks => {
    tasks.value = respTasks
    title.value = t
    showModal.value = true
  })
}

defineExpose({
  show
})

</script>

<style lang="less">
.tasks_card_modal{
  .ivu-modal-close{
    z-index: 2 !important;
  }
  .ivu-modal-header {
    position: sticky;
    top: 0;
    background: white;
    z-index: 1;
    border-radius: 10px 10px 0 0;
  }

  .ivu-modal{
    position: absolute;
    top: 0;
    right: 0;
  }

  .ivu-modal-body{
    background-color: #eee;
    height: 100%;
    overflow: hidden;
  }
  .aui-i-tasks {
    overflow-y: scroll;
    height: 100%;

    .aui-task{
      background-color: #fff;
    }
  }
}
</style>
