<template>
  <div :class="`aui-lane ${displayMode===LANE_DISPLAY_MODE_LIST?'bgt':''}`">
    <div :class="className">
      <p class="aui-i-title">{{ currLane.name }}&nbsp;∙&nbsp;({{ currLane.tasks.length }}/{{ currLane.wip || '∞' }})
        <Loading v-if="currLane.loadingTasks" style="top:-15px"/>
      </p>
      <div class="aui-i-actions">
        <template v-if="isEpicType(kanbanType)">
          <Icon v-if="displayMode===LANE_DISPLAY_MODE_CARD" type="ios-map-outline" size="18" class="aui-i-action"
                @click="changeMode(LANE_DISPLAY_MODE_LIST)"/>
        </template>
        <template v-else>
          <Icon v-if="kanbanMemberStatsSight" type="ios-albums" size="20" class="aui-i-action"
                @click="onSwitchKanbanMemberStatsSight"/>
          <Icon v-else type="ios-people" class="aui-i-action" size="20" @click="onSwitchKanbanMemberStatsSight"/>
        </template>
        <Dropdown placement="bottom-end" @on-click="onClickAction">
          <Icon type="md-more" size="22" class="aui-i-action"/>
          <template #list>
            <DropdownMenu>
              <DropdownItem name="add">在右边添加</DropdownItem>
              <DropdownItem name="laneManager">管理员</DropdownItem>
              <DropdownItem name="edit">修改</DropdownItem>
              <DropdownItem v-if="!currLane.isLast" name="del">删除</DropdownItem>
            </DropdownMenu>
          </template>
        </Dropdown>
      </div>
    </div>
    <draggable
        v-if="!kanbanMemberStatsSight && displayMode === LANE_DISPLAY_MODE_CARD"
        :id="laneId"
        class="aui-i-tasks"
        v-model="tasks"
        item-key="id"
        :animation="200"
        group="task"
        :disabled="false"
        ghostClass="ghost"
        chosenClass="chosen"
        handle=".aui-i-tasks > .aui-task > .aui-i-body"
        @start="drag = true"
        @end="drag = false"
        @sort="onListChange"
    >
      <template #item="{element:task, index}">
        <TaskCard
            v-if="currLane.isKanbanLane()"
            v-model:task="tasks[index]"
            :lane="currLane"
            :projectId="projectId"
        ></TaskCard>
        <EpicCard
            v-else-if="currLane.isEpicLane()"
            v-model:task="tasks[index]"
            :lane="currLane"
            :projectId="projectId"
        ></EpicCard>
      </template>
    </draggable>
    <EpicList
        v-else-if="!kanbanMemberStatsSight && displayMode === LANE_DISPLAY_MODE_LIST"
        :lane="currLane"
    ></EpicList>
    <MemberStatsCard
        v-else-if="kanbanMemberStatsSight && displayMode === LANE_DISPLAY_MODE_CARD"
        :lane="currLane"
        @onSelectMember="onSelectMemberOnStatsCard"
    >
    </MemberStatsCard>
  </div>
</template>

<script setup>
import {computed, inject, onMounted, ref, watch} from 'vue'
import {Dropdown, DropdownItem, DropdownMenu, Icon, Modal} from 'view-ui-plus'
import Draggable from 'vuedraggable'
import {useConfigStore, useModalStore, useTaskFilterStore} from '@/store'
import EpicCard from '@/views/project/epic_card.vue'
import EpicList from '@/views/project/epic_list.vue'
import TaskCard from '@/views/project/task_card.vue'
import MemberStatsCard from '@/views/project/member_stats_card.vue'
import {isEpicType, LANE_DISPLAY_MODE_CARD, LANE_DISPLAY_MODE_LIST} from '@/business/model/constant'
import {storeToRefs} from "pinia";
import Loading from "@/components/loading.vue";

const modalStore = useModalStore()
const configStore = useConfigStore()
const {closeKanbanMemberStatsSight} = storeToRefs(configStore)

const taskFilterStore = useTaskFilterStore()

const emit = defineEmits(['onChangeDisplayMode'])
const props = defineProps(['laneId', 'index', 'kanbanType', 'displayMode'])

const kanbanMemberStatsSight = ref(false)

const project = inject('project')
const projectId = inject('projectId')
const currLane = computed(() => {
  return project.value.getLane(props.laneId, props.kanbanType)
})
const laneMinWidth = computed(() => {
  return isEpicType(props.kanbanType) ? '400px' : '280px'
})
const drag = ref(false)

const tasks = computed({
  get() {
    return currLane.value.tasks
  },
  set(val) {
    currLane.value.tasks = val
  }
})

const className = computed(() => {
  let cn = 'aui-i-header'
  if (!currLane.value.isFirst && !currLane.value.isLast) {
    cn += ' aui-a-draggable'
  }
  if (props.displayMode === LANE_DISPLAY_MODE_LIST) {
    cn += ' hide'
  }
  return cn
})

watch(closeKanbanMemberStatsSight, (newVal, oldVal) => {
  if (newVal) {
    kanbanMemberStatsSight.value = false
  }
})

onMounted(() => {
  loadTasks({}, ['-display_index'])
})

const loadTasks = (filters, orderFields) => {
  currLane.value.loadTasks(filters, orderFields)
}

const changeMode = mode => {
  emit('onChangeDisplayMode', mode, currLane.value.id)
}

const onListChange = (event) => {
  if (event.from.id === String(props.laneId)) {
    if (event.from.id !== event.to.id) {
      return
    }
  }
  let taskId = event.item.getAttribute('taskId')
  const targetTasks = [...event.to.children]
  let beforeTaskId
  targetTasks.forEach((el, index) => {
    if (el.getAttribute('taskId') === taskId) {
      if (index < targetTasks.length - 1) {
        beforeTaskId = parseInt(targetTasks[index + 1].getAttribute('taskId'))
      }
    }
  })

  const sourceLaneId = parseInt(event.from.id)
  const targetLaneId = parseInt(event.to.id)
  const targetLane = project.value.getLane(targetLaneId, props.kanbanType)
  const curTask = targetLane.getTask(parseInt(taskId))
  curTask.laneId = targetLaneId

  project.value.shuttleTask(sourceLaneId, targetLaneId, curTask, beforeTaskId)
}

const onClickAction = (name) => {
  switch (name) {
    case 'add':
      modalStore.show('laneModal', {
        'projectId': projectId,
        'lane': currLane.value,
        'kanbanType': currLane.value.kanbanType,
        'mode': 'create'
      })
      break
    case 'laneManager':
      modalStore.show('usersSelectModal', {
        title: '泳道管理员设置',
        projectId: projectId,
        laneId: currLane.value.id,
        selectedUserIds: currLane.value.managerIds,
        limitCount: -1,  // 不限人数
        action: 'selectManagersForLane'
      })
      break
    case 'edit':
      modalStore.show('laneModal', {
        'projectId': projectId,
        'lane': currLane.value,
        'mode': 'update'
      })
      break
    case 'del':
      Modal.confirm({
        title: '删除泳道',
        content: '<strong>确定要删除该泳道么？</strong><p>请在删除前清理掉泳道中的任务！！！</p>',
        okText: '确认',
        cancelText: '等一下',
        onOk: () => {
          project.value.deleteLane(props.laneId)
        }
      })
      break
  }
}

const onSelectMemberOnStatsCard = (memberId) => {
  taskFilterStore.updateAssignorId(memberId)
  kanbanMemberStatsSight.value = false
  configStore.closeAllKanbanMemberStatsSight()
}

const onSwitchKanbanMemberStatsSight = () => {
  kanbanMemberStatsSight.value = !kanbanMemberStatsSight.value
}

const laneWidthGrow = isEpicType(props.kanbanType) ? 1 : 0

defineExpose({
  loadTasks
})

</script>

<style scoped lang="less">
.aui-lane {
  outline: 0;
  width: v-bind(laneMinWidth);
  flex-shrink: 0;
  flex-grow: v-bind(laneWidthGrow);
  padding: 5px 5px 25px;
  margin: 5px;
  border-radius: 5px;

  .aui-i-header {
    display: flex;
    justify-content: space-between;

    .aui-i-title {
      font-size: 16px;
      font-weight: bold;
    }

    .aui-i-actions {
      &:hover {
        cursor: auto;
      }

      .aui-i-action {
        &:hover {
          transform: scale(1.2);
        }
      }
    }
  }

  .aui-i-skeleton {
    margin: 10px 0;
    padding: 10px;
    border-radius: 2px;
  }

  .aui-i-tasks {
    overflow-y: scroll;
    height: 100%;
  }
}
</style>
