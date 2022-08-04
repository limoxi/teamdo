<template>
  <div class="kanban-page" tabindex="0" style="outline: 0; overflow: hidden;"
       @keydown.left="onPressLeft"
       @keydown.right="onPressRight"
       @keydown.esc="onEsc"
  >
    <action-bar @search="handleSearch" @on-fullscreen="onFullscreen" :lanes="lanes"></action-bar>
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
      <template #item="{element, index}">
        <lane-card
          :filters="filters"
          :key="element.id"
          :index="index"
          :lane="element"
          :lanes="lanes"
          :projectId="project.id"
          @on-deleted="onDeleteLane"
        />
      </template>
      <div class="aui-i-blank"></div>
    </draggable>

    <div class="scrollControl" id="scrollControl">
      <span class="scroll-button" id="scrollBtn"></span>
    </div>
  </div>

  <lane-modal @on-submitted="getLanes"></lane-modal>

</template>

<script setup>
import Draggable from 'vuedraggable';
import LaneCard from './lane_card';
import ActionBar from './kanban_action_bar'
import LaneModal from '@/components/modal/lane_modal';
import LaneService from '@/service/lane_service';
import {ref, inject, onMounted, nextTick, computed} from "vue";
import {Message} from "view-ui-plus";
import helper from '@/utils/helper'

const project = inject('project').value

onMounted(() => {
  getLanes();
  handleScroll()
})

let lanes = ref([])
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

const onPressLeft = () =>{
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

const onListChange = () => {
  LaneService.resort(project.id, lanes.value).then(() => {
    Message.success('排序完成');
  }).catch(err => {
    console.error(err);
    Message.error('排序失败');
  })
}

const onDeleteLane = (deletedLane) => {
  helper.removeFromArray(deletedLane, lanes.value, 'id');
}

const getLanes = () => {
  LaneService.getLanes(project.id).then(data => {
    lanes.value = data
  })
}

const handleSearch = (f) => {
  filters.value = f
}

const handleScroll = () => {
  nextTick(() => {
    const scrollBtn = document.getElementById('scrollBtn')
    const scrollControl = document.getElementById('scrollControl')
    const webview = document.getElementById('board')

    //获取最大位置
    const nMax = scrollControl.offsetWidth - scrollBtn.offsetWidth;

    scrollBtn.addEventListener('mousedown', function (event) {
      this.style.opacity = 1
      const initX = event.clientX
      const initLeft = this.offsetLeft

      document.onmousemove = (el) => {
        el.preventDefault()
        let x = el.clientX - initX + initLeft

        if (x >= nMax) {
          x = nMax
        }

        if(x <= 0){
          x = 0
        }
        this.style.left = x + 'px'
        let scrollLeft = 0
        scrollLeft = ((webview.scrollWidth - webview.clientWidth) * x) / scrollControl.clientWidth
        if (x === nMax) {
          scrollLeft = ((webview.scrollWidth - webview.clientWidth) * (x + scrollBtn.clientWidth)) / scrollControl.clientWidth
        }
        webview.scrollLeft = scrollLeft

      }

      document.onmouseup = (event) => {
        document.onmousemove = null;
        document.onmouseup = null;
        this.style.opacity = 0.3
      }
    })
  })
}
</script>

<style lang="less" scoped>
.kanban-page {
  position: relative;
  .scrollControl{
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
