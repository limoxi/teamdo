<template>
  <div class="aui-works-bar">
    <div class="aui-i-left">
      <Button type="text" icon="md-add" @click="onAddTask" class="aui-icon-scale">提交工单</Button>
      <Button type="text" icon="md-filing" @click="onArrange" class="aui-icon-scale">流程编排</Button>
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

      <Select
          filterable
          clearable
          v-model="selectedCreatorId"
          placeholder="创建人"
          @on-change="handleSearch"
          class="aui-i-filter"
      >
        <Option v-for="member in project.users" :value="member.id" :key="member.id">
          <img class="aui-user-selector-avatar" :src="member.avatar || defaultAvatar" alt="avatar"/> {{
            member.nickname
          }}
        </Option>
      </Select>
      <Select
          filterable
          clearable
          v-model="selectedAssignorId"
          placeholder="责任人"
          @on-change="handleSearch"
          class="aui-i-filter"
      >
        <Option v-for="member in project.users" :value="member.id" :key="member.id">
          <img class="aui-user-selector-avatar" :src="member.avatar || defaultAvatar" alt="avatar"/> {{
            member.nickname
          }}
        </Option>
      </Select>
      <Select style="width:140px;margin-left: 5px" v-model="orderField" @on-change="handleSearch">
        <Option value="display_index">自然排序</Option>
        <Option value="id">按创建时间</Option>
        <Option value="updated_at">按最后更新时间</Option>
        <Option value="expected_finished_at">按截止时间</Option>
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
import {computed, inject, ref, watch} from 'vue'
import defaultAvatar from '@/assets/images/default-avatar.webp';
import {Message} from "view-ui-plus"
import {useModalStore, useTaskFilterStore} from '@/store'
import {storeToRefs} from "pinia";
import {useRouter} from "vue-router";

const router = useRouter()

const modalStore = useModalStore()
const taskFilterStore = useTaskFilterStore()
const {updated: updated} = storeToRefs(taskFilterStore)

const project = inject('project')
const projectId = computed(() => project.value.id)

const filters = ref({})
const emit = defineEmits(['search'])
const orderField = ref('display_index')
const orderDirection = ref('-')
const filteredTaskInfo = ref('')
const selectedCreatorId = ref(0)
const selectedAssignorId = ref(0)

watch(updated, (newVal, oldVal) => {
  if (newVal) {
    handleSearch()
    updated.value = false
  }
})

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

  if (selectedCreatorId.value > 0) {
    filters['creator_id'] = selectedCreatorId.value
  }
  if (selectedAssignorId.value > 0) {
    filters['assignor_id'] = selectedAssignorId.value
  }
  emit('search', {
    filters,
    orderFields
  })
}

const onAddTask = () => {
  modalStore.show('epicModal', {
    projectId: projectId.value
  })
}

const onArrange = () => {
  router.push({
    name: 'lanesArrangement',
    params: {
      projectId: project.value.id
    }
  });
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
    content: '刷新列表...',
    duration: 5,
    onClose: () => {
      refreshing = false
    }
  })
}

</script>

<style lang="less" scoped>
.aui-works-bar {
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
