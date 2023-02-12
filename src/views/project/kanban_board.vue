<template>
  <div class="kanban-page" tabindex="0" style="outline: 0; overflow: hidden;"
       @keydown.left="onPressLeft"
       @keydown.right="onPressRight"
       @keydown.esc="onEsc"
  >
    <action-bar @search="handleSearch" @on-fullscreen="onFullscreen"></action-bar>
    <draggable
        :class="classNames"
        id="board"
        v-model="project.lanes"
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
      <template #item="{element, index}">
        <lane-card
            :filters="filters"
            :key="element.id"
            :index="index"
            :laneId="element.id"
            :projectId="projectId"
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
import LaneModal from '@/components/modal/lane_modal';
import LaneService from '@/business/lane_service';
import {computed, inject, ref} from "vue";
import {Message} from "view-ui-plus";

const project = inject('project')
const projectId = computed(() => project.value.id)

let drag = ref(false)
let filters = ref(null)
let fullscreen = ref(false)

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

const onListChange = (e) => {
  LaneService.resort(projectId.value, project.value.lanes).then(() => {
    Message.success('排序完成');
  }).catch(err => {
    console.error(err);
    Message.error('排序失败');
  })
}

const handleSearch = (f) => {
  filters.value = f
}

</script>

<style lang="less" scoped>
.kanban-page {
  position: relative;

  .scrollControl {
    display: none;
    width: 200px;
    height: 10px;
    background: #ccc;
    position: fixed;
    bottom: 60px;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 5px;

    .scroll-button {
      display: inline;
      cursor: pointer;
      width: 20px;
      height: 14px;
      background: rgb(23, 109, 240);
      position: absolute;
      top: -2px;
      left: 0;
      border-radius: 7px;
      opacity: 0.3;
    }
  }
}
</style>
