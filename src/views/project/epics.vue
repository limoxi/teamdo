<template>
  <div class="epics-page">
    <EasyTable
        :ref="table"
        :loadingFn="loadPagedEpicTasks"
        :columns="columns"
    >
      <template #search>
        <action-bar @search="handleSearch"></action-bar>
      </template>
      <template #row-expend="{record}">
        <div>
          <Space>
            <span>概述：{{ record.name }}</span>
            <Space>
              <a v-if="record.docLink" :href="record.docLink" target="_blank">文档链接</a>
              <a v-if="record.designLink" :href="record.designLink" target="_blank">设计链接</a>
            </Space>
          </Space>
        </div>
      </template>
      <template #importance="{record}">
        {{ getImportanceDesc(record.importance) }}
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
import EpicTaskService from '@/service/epic_task_service';
import EpicTask from '@/store/epic';
import EasyTable from '@/components/EasyTable';
import {getImportanceDesc} from '@/utils/constant';
import {Space} from "view-ui-plus";

const modalStore = useModalStore()

const projectId = inject('projectId')
const project = inject('project')
const loadingTasks = ref(true)
const table = ref(null)

const filters = ref({})
const orderFields = ref([])
const columns = [
  {
    key: 'id',
    name: '编号'
  }, {
    key: 'importance',
    name: '优先级',
    slot: 'importance'
  }, {
    key: 'createdAt',
    name: '创建时间',
    width: '160px'
  }, {
    key: 'expectedFinishedAt',
    name: '截止时间',
    width: '160px'
  }, {
    key: 'status',
    name: '状态',
    slot: 'status'
  }, {
    key: 'creator_id',
    name: '维护人',
    slot: 'creator'
  }, {
    key: 'action',
    name: '操作',
    slot: 'action'
  }
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
