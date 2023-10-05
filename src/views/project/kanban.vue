<template>
  <div class="kanban-page" tabindex="0" style="outline: 0; overflow: hidden;"
       @keydown.left="onPressLeft"
       @keydown.right="onPressRight"
       @keydown.esc="onEsc"
  >
    <action-bar @search="handleSearch" @on-fullscreen="onFullscreen"
        :kanbanType="kanbanType" :displayMode="displayMode" @on-change-displayMode="onChangeDisplayMode"
    ></action-bar>
    <draggable
        :class="classNames"
        id="board"
        v-model="lanes"
        item-key="id"
        :animation="200"
        group="lanes"
        :disabled="false"
        ghostClass="ghost"
        chosenClass="chosen"
        handle=".aui-board > .aui-lane > .aui-a-draggable"
        @start="drag = true"
        @end="drag = false"
        @sort="onListChange"
    >
      <template #item="{element:lane, index}">
        <LaneCard
            v-if="showSingleLaneId === 0 || showSingleLaneId === lane.id"
            :ref="el => laneCardRefs[index] = el"
            :key="lane.id"
            :index="index"
            :laneId="lane.id"
            :kanbanType="kanbanType"
            :displayMode="displayMode"
            @on-change-displayMode="onChangeDisplayMode"
        />
      </template>
      <div class="aui-i-blank"></div>
    </draggable>
  </div>

  <lane-modal/>

</template>

<script setup>
import Draggable from 'vuedraggable';
import LaneCard from './lane_card';
import ActionBar from './kanban_action_bar'
import LaneModal from '@/components/modal/lane_modal'
import LaneService from '@/business/lane_service'
import {computed, inject, onBeforeUpdate, onMounted, ref} from 'vue'
import {Message} from "view-ui-plus"
import {isEpicType, isKanbanType, LANE_DISPLAY_MODE_CARD, LANE_DISPLAY_MODE_LIST} from '@/business/model/constant'

const laneCardRefs = ref([])
const props = defineProps(['kanbanType'])
const project = inject('project')
const projectId = inject('projectId')
const showSingleLaneId = ref(0)

let drag = ref(false)
let fullscreen = ref(false)

const lanes = computed({
  get: () => {
    return isKanbanType(props.kanbanType)? project.value.kanbanLanes: isEpicType(props.kanbanType)? project.value.epicLanes: []
  },
  set: val => {
    if (isKanbanType(props.kanbanType)) {
      project.value.kanbanLanes = val
    } else if (isEpicType(props.kanbanType)) {
      project.value.epicLanes = val
    }
  }
})
const displayMode = ref(lanes.length === 1 ? LANE_DISPLAY_MODE_LIST : LANE_DISPLAY_MODE_CARD)

const classNames = computed(() => {
  let cn = 'aui-board'
  if (fullscreen.value) {
    cn += ' aui-board-fullscreen'
  }
  return cn
})

const onPressLeft = () => {
  document.getElementsByClassName('aui-board')[0].scrollLeft -= 500
}

const onPressRight = () => {
  document.getElementsByClassName('aui-board')[0].scrollLeft += 500
}

const onFullscreen = () => {
  fullscreen.value = true
}

const onEsc = () => {
  fullscreen.value = false
}

const onChangeDisplayMode = (mode, laneId=0) => {
  displayMode.value = mode
  showSingleLaneId.value = laneId
}

const onListChange = (e) => {
  LaneService.resort(projectId, project.value.getLanesByKanbanType(props.kanbanType)).then(() => {
    Message.success('排序完成');
  }).catch(err => {
    console.error(err);
    Message.error('排序失败');
  })
}

onBeforeUpdate(() => {
  laneCardRefs.value = []
})

const handleSearch = (data) => {
  let orderFields = ['-display_index']
  if (data.orderFields && data.orderFields.length > 0) {
    orderFields = data.orderFields
  }

  for(const laneCardRef of laneCardRefs.value) {
    laneCardRef.loadTasks(data.filters, orderFields)
  }
}

</script>

<style lang="less" scoped>
.kanban-page {
  position: relative;
}
</style>
