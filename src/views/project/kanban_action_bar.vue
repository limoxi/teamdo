<template>
  <div class="aui-kanban-action-bar">
    <div class="aui-i-left">
      <Button type="text" icon="md-add" @click="onAddTask" class="aui-icon-scale">添加</Button>
      <Button type="text" @click="onSwitchMode">{{
          selectModeOn ? `取消选择(${selectedTasks.length})` : '选择'
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
            <template v-for="l in project.getLanesByKanbanType(kanbanType)" :key="l.id">
              <DropdownItem :name="l.id">
                {{ l.name }}
              </DropdownItem>
            </template>
          </DropdownMenu>
        </template>
      </Dropdown>
    </div>
    <div class="aui-i-right">
      <template v-if="kanbanType===KANBAN_TYPE_EPIC">
        <Icon v-if="displayMode===LANE_DISPLAY_MODE_LIST" type="ios-albums" class="aui-i-icon"
              style="font-weight: bold" @click="changeMode(LANE_DISPLAY_MODE_CARD)"/>
      </template>
      <Icon type="md-qr-scanner" class="aui-i-icon" @click="onExpand"/>
      <Icon type="md-refresh" class="aui-i-icon" @click="onFreshTasks"/>
      <template v-if="kanbanType===KANBAN_TYPE_KANBAN">
        <Icon v-if="storySight" type="md-speedometer" class="aui-i-icon" @click="configStore.switchStorySight"/>
        <Icon v-else type="md-clock" class="aui-i-icon" @click="configStore.switchStorySight"/>
        <Icon v-if="prioritySight" type="md-glasses" class="aui-i-icon" @click="configStore.switchKanbanSight"/>
        <Icon v-else type="md-eye" class="aui-i-icon" @click="configStore.switchKanbanSight"/>
      </template>
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
          placeholder="标签"
          @onChange="handleSearch"
          class="aui-i-filter"
      >
        <Option v-for="tag in project.getTagsByKanbanType(kanbanType)" :value="tag.id" :key="tag.id">
          <Badge :color="tag.color" :text="tag.name"/>
        </Option>
      </Select>

      <Select
          v-if="isKanbanType(kanbanType)"
          filterable
          clearable
          v-model="selectedAssignorId"
          placeholder="执行人"
          :remote-method="searchUser"
          @on-change="handleSearch"
          class="aui-i-filter"
      >
        <Option v-for="member in selectableUsers" :value="member.id" :key="member.id">
          <img class="aui-user-selector-avatar" :src="member.avatar || defaultAvatar" alt="avatar"/> {{
            member.nickname
          }}
        </Option>
      </Select>
      <Select
          v-if="isEpicType(kanbanType)"
          filterable
          clearable
          v-model="selectedCreatorId"
          placeholder="维护人"
          :remote-method="searchUser"
          @on-change="handleSearch"
          class="aui-i-filter"
      >
        <Option v-for="member in selectableUsers" :value="member.id" :key="member.id">
          <img class="aui-user-selector-avatar" :src="member.avatar || defaultAvatar" alt="avatar"/> {{
            member.nickname
          }}
        </Option>
      </Select>
      <template v-if="isEpicType(kanbanType)">
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
      </template>
      <ButtonGroup style="margin-left: 10px">
        <Button :type="kanbanViewMode==='card'?'primary':'default'" @click="()=> kanbanViewMode='card'">
          <Icon type="ios-card" style="font-size: 22px;vertical-align: bottom"/>
        </Button>
        <Button :type="kanbanViewMode==='table'?'primary':'default'" @click="()=> kanbanViewMode='table'">
          <Icon type="md-grid" style="font-size: 18px;vertical-align: bottom"/>
        </Button>
      </ButtonGroup>
    </div>
  </div>
  <share-tasks-modal :tasks="selectedTasks" v-model:show="showShareModal"></share-tasks-modal>
</template>

<script setup>
import {computed, inject, ref, watch} from 'vue'
import defaultAvatar from '@/assets/images/default-avatar.webp';
import ShareTasksModal from '@/components/modal/share_tasks_modal'
import {Badge, Dropdown, DropdownItem, DropdownMenu, Icon, Message} from 'view-ui-plus'
import {useConfigStore, useModalStore, useTaskFilterStore, useTaskModeStore} from '@/store'
import {storeToRefs} from "pinia";
import PinyinMatch from "pinyin-match";
import {
  isEpicType,
  isKanbanType,
  KANBAN_TYPE_EPIC,
  KANBAN_TYPE_KANBAN,
  LANE_DISPLAY_MODE_CARD,
  LANE_DISPLAY_MODE_LIST
} from '@/business/model/constant'

const modalStore = useModalStore()
const taskFilterStore = useTaskFilterStore()
const {tagId: selectedTagId, assignorId: selectedAssignorId, updated: updated} = storeToRefs(taskFilterStore)

const taskModeStore = useTaskModeStore()
const {mode: taskMode, selectedTasks} = storeToRefs(taskModeStore)
const selectModeOn = computed(() => taskMode.value === 'SELECT')

const props = defineProps(['kanbanType', 'displayMode'])

const kanbanViewMode = ref('card')

const configStore = useConfigStore()
const {prioritySight, storySight} = storeToRefs(configStore)

const project = inject('project')
const projectId = inject('projectId')


const filters = ref({})
const emit = defineEmits(['search', 'onFullscreen', 'onChangeDisplayMode'])
const filteredTaskInfo = ref('')
const selectedCreatorId = ref(0)
const orderField = ref('display_index')
const orderDirection = ref('-')
let showShareModal = ref(false)

const selectableUsers = ref(project.value?.users || [])

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

const onClickSwitch = (targetLaneId) => {
  project.value.shuttleTasks(targetLaneId, selectedTasks.value).then(() => {
    onSwitchMode()
  }).catch(err => {
    Message.error(err.errMsg || '批量操作失败');
  });
}

const changeMode = mode => {
  emit('onChangeDisplayMode', mode)
}

const searchUser = (query) => {
  selectableUsers.value = project.value?.users.filter(user => {
    return !!(PinyinMatch.match(user.nickname, query))
        || user.nickname === query
        || query === ''
  })
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
  const orderFields = [`${orderDirection.value}${orderField.value}`]
  emit('search', {
    filters,
    orderFields
  })
}

const onClickShare = () => {
  if (selectedTasks.value.length === 0) {
    Message.warning('还没有选择卡片！')
    return
  }
  showShareModal.value = true
}

const onSwitchMode = () => {
  taskModeStore.changeMode()
}

const onAddTask = () => {
  let modalName = ''
  if (isKanbanType(props.kanbanType)) {
    modalName = 'taskModal'
  } else if (isEpicType(props.kanbanType)) {
    modalName = 'epicModal'
  }

  if (modalName === '') {
    Message.error('非法操作！')
    return
  }
  modalStore.show(modalName, {
    projectId: projectId
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
    content: '刷新中...',
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
