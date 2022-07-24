<template>
  <div class="kanban-page" tabindex="0" style="outline: 0; overflow: hidden;"
       @keydown.left="onPressLeft"
       @keydown.right="onPressRight"
  >
    <action-bar @search="handleSearch" :lanes="lanes"></action-bar>
    <draggable
        class="aui-board"
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
          :projectId="parseInt(projectId)"
          @laneDeleted="onDeleteLane"
        />
      </template>
      <div class="aui-i-blank"></div>
    </draggable>

    <div class="scrollControl" id="scrollControl">
      <span class="scroll-button" id="scrollBtn"></span>
    </div>
  </div>

</template>

<script>
import Draggable from 'vuedraggable';
import LaneCard from './lane_card';
import ActionBar from './kanban_action_bar'
import LaneService from '@/service/lane_service';

import {events, EventBus} from '@/service/event_bus'

export default {
  props: ['projectId'],

  created() {
    EventBus.on(events.LANE_UPDATED, this.getLanes);

    this.getLanes();

    this.handleScroll()
  },

  data() {
    return {
      'lanes': [],
      'dragOptions': {
        animation: 200,
        group: "description",
        disabled: false,
        ghostClass: "ghost",
        chosenClass: "chosen",
        handle: '.aui-board > .aui-lane > .aui-a-draggable'
      },
      'drag': false,
      'chosenLane': null,
      'filters': null
    }
  },
  components: {
    LaneCard,
    ActionBar,
    Draggable,
  },
  methods: {
    onPressLeft(){
      document.getElementsByClassName('aui-board')[0].scrollLeft -= 500
    },
    onPressRight(){
      document.getElementsByClassName('aui-board')[0].scrollLeft += 500
    },
    onListChange(event) {
      LaneService.resort(this.projectId, this.lanes).then(() => {
        this.$Message.success('排序完成');
      }).catch(err => {
        console.error(err);
        this.$Message.error('排序失败');
      })
    },
    onDeleteLane(deletedLane) {
      let laneIndex = this.lanes.findIndex(lane => {
        return lane.id === deletedLane.id;
      });
      this.lanes.splice(laneIndex, 1);
    },
    getLanes() {
      LaneService.getLanes(this.projectId).then(lanes => {
        this.lanes = lanes;
      });
    },
    handleSearch(filters) {
      this.filters = filters
    },

    handleScroll () {
      this.$nextTick(() => {
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
  }
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
