<template>
  <div class="epics-page">
    <EasyTable
        :ref="table"
        :loadingFn="loadPagedEpicTasks"
        :filters="filters"
        :columns="columns.map(c => c.key)"
    >
      <template #search>
        <action-bar @search="handleSearch"></action-bar>
      </template>
      <template #row="{record, index}">
        {{ record.name }}
      </template>
    </EasyTable>
    <!--    <Result v-else type="warning" title="还没有任何需求">-->
    <!--      <template #desc>-->
    <!--        添加一个需求吧~-->
    <!--      </template>-->
    <!--      <template #actions>-->
    <!--        <Button icon="md-add" @click="onAddTask" class="aui-icon-scale">添加需求</Button>-->
    <!--      </template>-->
    <!--    </Result>-->
  </div>
</template>

<script setup>
import ActionBar from './epics_action_bar'
import {inject, ref} from "vue"
import {useModalStore} from '@/store'
import EpicTaskService from "@/service/epic_task_service";
import EpicTask from "@/store/epic";
import EasyTable from "@/components/EasyTable";

const modalStore = useModalStore()

const projectId = inject('projectId')
const project = inject('project')
const loadingTasks = ref(true)
const table = ref(null)

const filters = ref({})
const orderFields = ref([])
const columns = [
  '编号',
  '概述',
  '链接',
  '优先级',
  '创建时间',
  '截止时间',
  '状态',
  '维护人',
  '操作'
]

const handleSearch = (f) => {
  filters.value = f
  table.value.refresh()
}

const loadPagedEpicTasks = async (targetPage) => {
  loadingTasks.value = true
  const resp = await EpicTaskService.getEpicTasks(
      projectId,
      filters.value,
      {
        'with_tags': true,
        'with_users': true
      },
      orderFields.value,
      targetPage
  )
  return {
    records: resp.tasks.map(t => new EpicTask(t)),
    pageInfo: resp.page_info
  }
}

const onAddTask = () => {
  modalStore.show('epicModal', {
    projectId: projectId
  })
}

</script>

<style scoped lang="less">
.epics-page {

  .aui-i-table {
    margin: 5px;
  }
}

</style>
