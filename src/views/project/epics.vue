<template>
  <div class="epics-page">
    <template v-if="loadingTasks">
      <Skeleton
          style="margin-top: 25px"
          loading
          animated
          :title="false"
          :paragraph="{ rows: 5, width: ['80%', '100%', '100%', '100%', '100%'] }"
      />
    </template>
    <template v-else>
      <action-bar v-if="epicTasks.length>0" @search="handleSearch"></action-bar>
      <Table v-if="epicTasks.length>0" class="aui-i-table" border :columns="columns" :data="epicTasks">
        <template #links="{ row }">
          <a v-if="row.docLink" :href="row.docLink">文档链接</a>
          <a v-if="row.designLink" :href="row.designLink">设计链接</a>
        </template>
        <template #creator="{ row }">
          <strong v-if="project.users.length>0">{{
              project.users.filter(pu => pu.id === row.creatorId)[0].name
            }}</strong>
        </template>
        <template #action="{ row }">
          <Button type="text">编辑</Button>
        </template>
      </Table>
      <Page v-if="epicTasks.length>0" v-model="targetPage.curPage" @change="onPageChange"
            :total="targetPage.totalCount" :page-size="targetPage.pageSize" show-total/>
      <Result v-else type="warning" title="还没有任何需求">
        <template #desc>
          添加一个需求吧~
        </template>
        <template #actions>
          <Button icon="md-add" @click="onAddTask" class="aui-icon-scale">添加需求</Button>
        </template>
      </Result>
    </template>
  </div>
</template>

<script setup>
import ActionBar from './epics_action_bar'
import {inject, onMounted, ref} from "vue"
import {useModalStore} from '@/store'
import EpicTaskService from "@/service/epic_task_service";
import EpicTask from "@/store/epic";
import {Button, Message} from "view-ui-plus";

const modalStore = useModalStore()

const projectId = inject('projectId')
const project = inject('project')
const loadingTasks = ref(true)

const filters = ref({})
const orderFields = ref([])
const withOptions = {
  'with_tags': true,
  'with_users': true
}
const columns = [
  {
    title: '编号',
    key: 'id'
  }, {
    title: '概述',
    key: 'name'
  }, {
    title: '链接',
    slot: 'links'
  }, {
    title: '优先级',
    key: 'importance'
  }, {
    title: '创建时间',
    key: 'created_at'
  }, {
    title: '截止时间',
    key: 'expectedFinishedAt'
  }, {
    title: '状态',
    key: 'status'
  }, {
    title: '维护人',
    slot: 'creator'
  }, {
    title: '操作',
    slot: 'action'
  }
]
const epicTasks = ref([])
const targetPage = ref({
  'curPage': 1,
  'pageSize': 20,
  'totalCount': 0
})

onMounted(() => {
  loadPagedEpicTasks()
})

const handleSearch = (f) => {
  filters.value = f
  loadPagedEpicTasks()
}

const loadPagedEpicTasks = () => {
  loadingTasks.value = true
  EpicTaskService.getEpicTasks(
      projectId,
      filters.value,
      withOptions,
      orderFields.value,
      targetPage.value
  ).then(resp => {
    epicTasks.value = resp.tasks.map(t => new EpicTask(t))
    targetPage.value.totalCount = resp.page_info.total_count
    loadingTasks.value = false
  }).catch(e => {
    Message.error(e?.message || '加载需求列表失败')
  })
}

const onPageChange = page => {
  targetPage.value.curPage = page
  loadPagedEpicTasks()
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
