<template>
  <div tabindex="0" style="outline: 0; overflow: hidden;"
       @keydown.left="onPressLeft"
       @keydown.right="onPressRight"
  >
    <action-bar @search="handleSearch" :lanes="lanes"></action-bar>
    <draggable
        class="aui-board"
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
    }
  }
}
</script>

<style lang="less" scoped>

</style>
