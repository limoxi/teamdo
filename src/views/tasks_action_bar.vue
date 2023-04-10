<template>
  <div class="aui-tasks-bar">
    <div class="aui-i-left">
    </div>
    <div class="aui-i-right">
      <Icon type="md-refresh" class="aui-i-icon" @click="onFreshTasks"/>
      <Input
          placeholder="筛选编号或内容"
          :border="false"
          style="width: 150px"
          class="aui-i-filter"
          v-model="filteredTaskInfo"
          clearable
          @on-enter="handleSearch"
          @on-clear="handleSearch"
      >
        <template #prefix>
          <Icon type="ios-search"/>
        </template>
      </Input>

	    <Select style="width:200px;margin-left: 5px" v-model="filteredProjectId" @on-change="handleSearch">
		    <Option :value="0">所有项目</Option>
		    <Option v-for="p in projects" :key="p.id" :value="p.id" >{{p.name}}</Option>
	    </Select>

	    <Select style="width:100px;margin-left: 5px" v-model="filteredTaskType" @on-change="handleSearch">
		    <Option value="all">所有类型</Option>
		    <Option value="REQ">需求</Option>
	      <Option value="OPT">优化</Option>
	      <Option value="BUG">BUG</Option>
	    </Select>

      <Select style="width:140px;margin-left: 5px" v-model="orderField" @on-change="handleSearch">
        <Option value="id">按创建时间</Option>
        <Option value="updated_at">按最后更新时间</Option>
        <Option value="importance">按优先级</Option>
      </Select>
      <Select style="width:70px;margin-left: 5px" v-model="orderDirection" @on-change="handleSearch">
        <Option value="-">倒序</Option>
        <Option value="+">顺序</Option>
      </Select>
    </div>
  </div>
</template>

<script setup>
import {computed, inject, onBeforeUnmount, onDeactivated, onMounted, ref, watch} from 'vue'
import defaultAvatar from '@/assets/images/default-avatar.webp';
import ShareTasksModal from '@/components/modal/share_tasks_modal'
import {Message} from "view-ui-plus"
import {useModalStore, useTaskFilterStore, useTaskModeStore} from '@/store'
import {storeToRefs} from "pinia";
import ProjectService from "../business/project_service";

const modalStore = useModalStore()
const taskFilterStore = useTaskFilterStore()
const {updated: updated} = storeToRefs(taskFilterStore)

const taskModeStore = useTaskModeStore()

const projects = ref([])
const filters = ref({})
const props = defineProps({
  lanes: Array
})
const emit = defineEmits(['search'])
const orderField = ref('updated_at')
const orderDirection = ref('-')
const filteredTaskInfo = ref('')
const filteredProjectId = ref(0)
const filteredTaskType = ref('all')

watch(updated, (newVal, oldVal) => {
  if (newVal) {
    handleSearch()
    updated.value = false
  }
})

onMounted(() => {
	getProjects()
})

const getProjects = () => {
	ProjectService.getProjects().then(data => {
		projects.value = data;
	}).catch(err => {
		Message.error(err.errMsg || '加载项目失败')
	});
}

const handleSearch = () => {
  const filters = {}
  const orderFields = [`${orderDirection.value}${orderField.value}`]
  if (filteredTaskInfo.value) {
    if (isNaN(filteredTaskInfo.value)) {
      filters['name__contains'] = filteredTaskInfo.value
    } else {
      filters['id'] = parseInt(filteredTaskInfo.value)
    }
  }

  if (filteredProjectId.value > 0) {
	  filters['project_id'] = filteredProjectId.value
  }

  if (filteredTaskType.value !== 'all') {
	  filters['type'] = filteredTaskType.value
  }

  emit('search', {
    filters,
    orderFields
  })
}

let refreshing = false
const onFreshTasks = () => {
  if (refreshing) {
    Message.warning('请勿频繁刷新...')
    return
  }
  refreshing = true
  handleSearch()
  Message.success({
    content: '刷新需求...',
    duration: 5,
    onClose: () => {
      refreshing = false
    }
  })
}

</script>

<style lang="less" scoped>
.aui-tasks-bar {
  width: 100%;
  max-height: 32px;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  margin-top: 1px;
  padding: 0 5px;

  .aui-i-icon {
    margin-right: 10px;
    font-size: 16px;
    vertical-align: middle;
    cursor: pointer;

    &:hover {
      transform: scale(1.1);
    }
  }

  .aui-i-filter {
    width: 135px;
    margin-left: 10px;
  }

}
</style>
