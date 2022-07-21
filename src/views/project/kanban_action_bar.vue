<template>
  <div class="aui-kanban-action-bar">
    <div class="aui-i-left">
      <Button type="text" @click="onSwitchMode">{{ selectModeOn ? '取消选择' : '选择任务' }}</Button>
      <Button type="text" v-if="selectModeOn" @click="onClickShare">分享({{selectedTasks.length}})</Button>
      <Dropdown
          trigger="click"
          v-if="selectModeOn && selectedTasks.length > 0"
          transfer placement="right-start"
          @on-click="onClickSwitch"
      >
        <Button icon="md-jet" style="border: none;"/>
        <template #list>
          <DropdownMenu>
            <template v-for="l in lanes" :key="l.id">
              <DropdownItem :name="l.id">
                {{ l.name }}
              </DropdownItem>
            </template>
          </DropdownMenu>
        </template>
      </Dropdown>
    </div>
    <div class="aui-i-right">
      <Icon type="md-refresh" class="aui-i-refresh" @click="onFreshTasks" />
      <Input
          placeholder="用户故事筛选"
          :border="false"
          style="width: 200px"
          class="aui-i-filter"
          v-model="taskName"
          clearable
          @on-enter="handleSearch"
          @on-clear="handleSearch"
      >
        <template #prefix>
          <Icon type="ios-search" />
        </template>
      </Input>

      <Select
          filterable
          clearable
          v-model="selectedAssignorId"
          placeholder="执行人"
          @on-change="handleSearch"
          class="aui-i-filter"
      >
        <Option v-for="member in members" :value="member.id" :key="member.id">
          <img class="aui-user-selector-avatar" :src="member.avatar || defaultAvatar" alt="avatar"/> {{ member.nickname }}
        </Option>
      </Select>
      <Select
          filterable
          clearable
          v-model="selectedCreatorId"
          placeholder="创建人"
          @on-change="handleSearch"
          class="aui-i-filter"
      >
        <Option v-for="member in members" :value="member.id" :key="member.id">
          <img class="aui-user-selector-avatar" :src="member.avatar || defaultAvatar" alt="avatar"/> {{ member.nickname }}
        </Option>
      </Select>
    </div>
  </div>
  <share-tasks-modal :tasks="selectedTasks" v-model:show="showShareModal"></share-tasks-modal>
</template>

<script setup>
import ProjectService from '@/service/project_service';
import TaskService from "@/service/task_service"
import {ref, computed, onMounted, inject, watch} from 'vue'
import defaultAvatar from '@/images/default-avatar.webp';
import {EventBus, events} from "@/service/event_bus"
import ShareTasksModal from '@/components/model/share_tasks_modal'
import {Message} from "view-ui-plus"
import helper from '@/utils/helper'

const filters = ref({})
const selectedTasks = ref([])
const props = defineProps({
  lanes: Array
})
const emit = defineEmits(['search'])
const members = ref([])
const taskName = ref('')
const selectedCreatorId = ref(0)
const selectedAssignorId = ref(0)
const project = inject('project')
let selectModeOn = ref(false)
let showShareModal = ref(false)

onMounted(() => {
  EventBus.on(events.TASK_CHECKED, (selectedTask, checked) => {
    if (checked) {
      selectedTasks.value.push(selectedTask)
    } else {
      helper.removeFromArray(selectedTask, selectedTasks.value, 'id')
    }
  })

  getMembers()
})

watch(showShareModal, (newVal, oldVal) => {
  if (!newVal) {
    onSwitchMode()
  }
})

const getMembers = () => {
  ProjectService.getProjectMembers(project.id).then(data => {
    members.value = data;
  }).catch(err => {
    Message.error(err.errMsg);
  });
}

const onClickSwitch = (targetLaneId) => {
  TaskService.switchLaneForTasks(project.id, selectedTasks.value, targetLaneId).then(() => {
    onSwitchMode()
    onFreshTasks()
  }).catch(err => {
    Message.error(err.errMsg || '批量操作失败');
  });
}

const handleSearch = () => {
  const filters = {}
  if (taskName.value !== '') {
    filters['name__contains'] = taskName.value
  }
  if (selectedAssignorId.value > 0) {
    filters['assignor_id'] = selectedAssignorId.value
  }
  if (selectedCreatorId.value > 0) {
    filters['creator_id'] = selectedCreatorId.value
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
  if (selectModeOn.value) {
    selectModeOn.value = false
    selectedTasks.value = []
    EventBus.emit(events.SWITCH_TASK_MODE, 'NORMAL')
  } else {
    selectModeOn.value = true
    EventBus.emit(events.SWITCH_TASK_MODE, 'CHECKING')
  }
}

let refreshing = false
const onFreshTasks = () => {
  if (refreshing) {
    Message.warning('请勿频繁刷新...')
    return
  }
  refreshing = true
  EventBus.emit(events.REFRESH_LANE_TASKS)
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
  display: flex;
  justify-content: space-between;
  margin-top: 1px;
  padding: 0 5px;

  .aui-i-refresh{
    font-size: 16px;
    vertical-align: middle;
    cursor: pointer;
    &:hover{
      transform: scale(1.1);
    }
  }

  .aui-i-filter {
    width: 130px;
    margin-left: 10px;
  }

}
</style>
