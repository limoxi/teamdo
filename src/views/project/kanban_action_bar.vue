<template>
  <div class="aui-kanban-action-bar">
    <div class="aui-i-left">
      <Button type="text" icon="md-add" @click="onAddTask" class="aui-icon-scale">添加任务</Button>
      <Button type="text" @click="onSwitchMode">{{
          selectModeOn ? `取消选择(${selectedTasks.length})` : '选择任务'
        }}
      </Button>
      <Button type="text" v-if="selectModeOn && selectedTasks.length > 0" @click="onClickShare">分享</Button>
      <Dropdown
          trigger="click"
          v-if="selectModeOn && selectedTasks.length > 0"
          transfer placement="right-start"
          @on-click="onClickSwitch"
      >
        <Button icon="md-jet" style="border: none;"/>
        <template #list>
          <DropdownMenu>
            <template v-for="l in project.lanes" :key="l.id">
              <DropdownItem :name="l.id">
                {{ l.name }}
              </DropdownItem>
            </template>
          </DropdownMenu>
        </template>
      </Dropdown>
    </div>
    <div class="aui-i-right">
      <Icon type="md-qr-scanner" class="aui-i-icon" @click="onExpand"/>
      <Icon type="md-refresh" class="aui-i-icon" @click="onFreshTasks"/>
      <Icon v-if="prioritySight" type="md-glasses" class="aui-i-icon" @click="configStore.switchKanbanSight"/>
      <Icon v-else type="md-eye" class="aui-i-icon" @click="configStore.switchKanbanSight"/>
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
          v-model="selectedTagId"
          filterable
          clearable
          placeholder="任务标签"
          @onChange="handleSearch"
          class="aui-i-filter"
      >
        <Option v-for="tag in project.tags" :value="tag.id" :key="tag.id">
          <Badge :color="tag.color" :text="tag.name"/>
        </Option>
      </Select>

      <Select
          filterable
          clearable
          v-model="selectedAssignorId"
          placeholder="执行人"
          @on-change="handleSearch"
          class="aui-i-filter"
      >
        <Option v-for="member in project.users" :value="member.id" :key="member.id">
          <img class="aui-user-selector-avatar" :src="member.avatar || defaultAvatar" alt="avatar"/> {{
            member.nickname
          }}
        </Option>
      </Select>
      <!--      <Select-->
      <!--          filterable-->
      <!--          clearable-->
      <!--          v-model="selectedCreatorId"-->
      <!--          placeholder="创建人"-->
      <!--          @on-change="handleSearch"-->
      <!--          class="aui-i-filter"-->
      <!--      >-->
      <!--        <Option v-for="member in project.users" :value="member.id" :key="member.id">-->
      <!--          <img class="aui-user-selector-avatar" :src="member.avatar || defaultAvatar" alt="avatar"/> {{-->
      <!--            member.nickname-->
      <!--          }}-->
      <!--        </Option>-->
      <!--      </Select>-->
    </div>
  </div>
  <share-tasks-modal :tasks="selectedTasks" v-model:show="showShareModal"></share-tasks-modal>
</template>

<script setup>
import {computed, inject, onBeforeUnmount, ref, watch} from 'vue'
import defaultAvatar from '@/assets/images/default-avatar.webp';
import ShareTasksModal from '@/components/modal/share_tasks_modal'
import {Message} from "view-ui-plus"
import {useConfigStore, useModalStore, useTaskFilterStore, useTaskModeStore} from '@/store'
import {storeToRefs} from "pinia";

const modalStore = useModalStore()
const taskFilterStore = useTaskFilterStore()
const {tagId: selectedTagId, updated: updated} = storeToRefs(taskFilterStore)

const taskModeStore = useTaskModeStore()
const {mode: taskMode, selectedTasks} = storeToRefs(taskModeStore)
const selectModeOn = computed(() => taskMode.value === 'SELECT')

const configStore = useConfigStore()
const {prioritySight} = storeToRefs(configStore)

const project = inject('project')
const projectId = computed(() => project.value.id)

const filters = ref({})
const emit = defineEmits(['search', 'onFullscreen'])
const filteredTaskInfo = ref('')
const selectedCreatorId = ref(0)
const selectedAssignorId = ref(0)
let showShareModal = ref(false)

const cancelWatch1 = watch(showShareModal, (newVal, oldVal) => {
  if (!newVal) {
    onSwitchMode()
  }
})

const cancelWatch2 = watch(updated, (newVal, oldVal) => {
  if (newVal) {
    handleSearch()
    updated.value = false
  }
})
onBeforeUnmount(() => {
  cancelWatch1()
  cancelWatch2()
})

const onClickSwitch = (targetLaneId) => {
  project.value.shuttleTasks(targetLaneId, selectedTasks.value).then(() => {
    onSwitchMode()
  }).catch(err => {
    Message.error(err.errMsg || '批量操作失败');
  });
}

const handleSearch = () => {
  const filters = {}
  if (filteredTaskInfo.value) {
    if (isNaN(filteredTaskInfo.value)) {
      filters['name__contains'] = filteredTaskInfo.value
    } else {
      filters['id'] = parseInt(filteredTaskInfo.value)
    }
  }

  if (selectedAssignorId.value > 0) {
    filters['assignor_id'] = selectedAssignorId.value
  }
  if (selectedCreatorId.value > 0) {
    filters['creator_id'] = selectedCreatorId.value
  }
  if (selectedTagId.value > 0) {
    filters['tag_id'] = selectedTagId.value
  }
  emit('search', filters)
}

const onClickShare = () => {
  if (selectedTasks.value.length === 0) {
    Message.warning('还没有选择任务卡片！')
    return
  }
  showShareModal.value = true
}

const onSwitchMode = () => {
  taskModeStore.changeMode()
}

const onAddTask = () => {
  modalStore.show('taskModal', {
    projectId: projectId.value
  })
}

const onExpand = () => {
  emit('onFullscreen')
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
    content: '刷新任务...',
    duration: 5,
    onClose: () => {
      refreshing = false
    }
  })
}

</script>

<style lang="less" scoped>
.aui-kanban-action-bar {
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
