<template>
  <div class="aui-epics-bar">
    <div class="aui-i-left">
      <Button type="text" icon="md-add" @click="onAddTask" class="aui-icon-scale">添加需求</Button>
      <!--      <Button type="text" @click="onSwitchMode">{{-->
      <!--          selectModeOn ? `取消选择(${selectedTasks.length})` : '选择需求'-->
      <!--        }}-->
      <!--      </Button>-->
      <!--      <Button type="text" v-if="selectModeOn && selectedTasks.length > 0" @click="onClickShare">分享</Button>-->
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
          placeholder="维护人"
          @on-change="handleSearch"
          class="aui-i-filter"
      >
        <Option v-for="member in project.users" :value="member.id" :key="member.id">
          <img class="aui-user-selector-avatar" :src="member.avatar || defaultAvatar" alt="avatar"/> {{
            member.nickname
          }}
        </Option>
      </Select>
    </div>
  </div>
  <share-tasks-modal :tasks="selectedTasks" v-model:show="showShareModal"></share-tasks-modal>
</template>

<script setup>
import {computed, inject, ref, watch} from 'vue'
import defaultAvatar from '@/images/default-avatar.webp';
import ShareTasksModal from '@/components/modal/share_tasks_modal'
import {Message} from "view-ui-plus"
import {useConfigStore, useLaneStore, useModalStore, useTaskFilterStore, useTaskModeStore} from '@/store'
import {storeToRefs} from "pinia";

const laneStore = useLaneStore()
const modalStore = useModalStore()
const taskFilterStore = useTaskFilterStore()
const {updated: updated} = storeToRefs(taskFilterStore)

const taskModeStore = useTaskModeStore()
const {mode: taskMode, selectedTasks} = storeToRefs(taskModeStore)
const selectModeOn = computed(() => taskMode.value === 'SELECT')

const configStore = useConfigStore()

const project = inject('project')
const projectId = computed(() => project.value.id)

const filters = ref({})
const props = defineProps({
  lanes: Array
})
const emit = defineEmits(['search'])
const filteredTaskInfo = ref('')
const selectedCreatorId = ref(0)
let showShareModal = ref(false)

watch(showShareModal, (newVal, oldVal) => {
  if (!newVal) {
    onSwitchMode()
  }
})

watch(updated, (newVal, oldVal) => {
  if (newVal) {
    handleSearch()
    updated.value = false
  }
})

const handleSearch = () => {
  const filters = {}
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
  emit('search', filters)
}

const onClickShare = () => {
  if (selectedTasks.value.length === 0) {
    Message.warning('还没有选择需求！')
    return
  }
  showShareModal.value = true
}

const onSwitchMode = () => {
  taskModeStore.changeMode()
}

const onAddTask = () => {
  modalStore.show('epicModal', {
    projectId: projectId.value
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
.aui-epics-bar {
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
