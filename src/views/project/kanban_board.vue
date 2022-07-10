<template>
  <div @keyup.ctrl.78.exact="onAddLane" tabindex="0" style="outline: 0"
       @focus="onFocus"
       @blur="onBlur"
  >
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
        <Lane
          :key="element.id"
          :index="index"
          :lane="element"
          :lanes="lanes"
          :projectId="projectId"
          :kanbanType="kanbanType"
          @laneDeleted="onDeleteLane"
        />
      </template>
      <div class="aui-i-blank"></div>
    </draggable>
  </div>

</template>

<script>
import Draggable from 'vuedraggable';
import Lane from '@/components/frame/block/lane';
import ProjectService from '@/service/project_service';
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
      'kanbanType': 'kanban',
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
    }
  },
  components: {
    Lane,
    Draggable,

  },
  methods: {
    onListChange(event) {
      LaneService.resort(this.projectId, this.kanbanType, this.lanes).then(() => {
        this.$Message.success('排序完成');
      }).catch(err => {
        console.log(err);
        this.$Message.error('排序失败');
      })
    },
    onAddLane() {
      EventBus.emit(events.LANE_ADDING);
    },
    onDeleteLane(deletedLane) {
      let laneIndex = this.lanes.findIndex(lane => {
        return lane.id === deletedLane.id;
      });
      this.lanes.splice(laneIndex, 1);
    },
    getLanes() {
      LaneService.getLanes(this.projectId, this.kanbanType).then(lanes => {
        this.lanes = lanes;
      });
    },
    onFocus() {
      EventBus.emit(events.HELP_REQUEST, 'Try Ctrl + N');
    },
    onBlur() {
      EventBus.emit(events.HELP_DONE);
    }
  }
}
</script>

<style lang="less" scoped>

</style>
