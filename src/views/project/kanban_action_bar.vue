<template>
  <div class="aui-kanban-action-bar">
    <div class="aui-i-left">
      <Button type="text" @click="onSwitchMode">{{ selectModeOn ? '取消选择' : '选择任务' }}</Button>
      <Button type="text" v-if="selectModeOn" @click="onClickShare">分享已选任务({{selectedTasks.length}})</Button>
    </div>
    <div class="aui-i-right">
      <Input
          placeholder="输入标题筛选"
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
          placeholder="按执行人筛选"
          @on-change="handleSearch"
          class="aui-i-filter"
      >
        <Option v-for="member in members" :value="member.id" :key="member.id">
          <img class="member-avatar" :src="member.avatar || defaultAvatar" alt="avatar"/> {{ member.nickname }}
        </Option>
      </Select>
      <Select
          filterable
          clearable
          v-model="selectedCreatorId"
          placeholder="按创建人筛选"
          @on-change="handleSearch"
          class="aui-i-filter"
      >
        <Option v-for="member in members" :value="member.id" :key="member.id">
          <img class="member-avatar" :src="member.avatar || defaultAvatar" alt="avatar"/> {{ member.nickname }}
        </Option>
      </Select>
    </div>
  </div>
  <share-tasks-modal :tasks="selectedTasks" v-model:show="showShareModal"></share-tasks-modal>
</template>

<script setup>
import ProjectService from '@/service/project_service';
import {ref, computed, onMounted, inject, watch} from 'vue'
import defaultAvatar from '@/images/default-avatar.webp';
import {EventBus, events} from "@/service/event_bus"
import ShareTasksModal from '@/components/model/share_tasks_modal'
import {Message} from "view-ui-plus"
import helper from '@/utils/helper'

const filters = ref({})
const selectedTasks = ref([])
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
</script>

<style lang="less">
.aui-kanban-action-bar {
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 10px;

  .aui-i-filter {
    width: 180px;
    margin-left: 10px;
    .ivu-select-item {
      display: flex;
      align-items: center;
    }
  }

  .member-avatar {
    width: 25px;
    height: 25px;
    border-radius: 50%;
    display: block;
    margin-right: 5px;
  }
}
</style>
