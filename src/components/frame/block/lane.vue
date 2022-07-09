<template>
  <div class="aui-lane">
    <div :class="className">
      <p class="aui-i-title">{{ lane.name }}&nbsp;∙&nbsp;({{ tasks.length }}/{{ lane.wip || '∞' }})</p>
      <div>
        <Icon v-if="index===0" type="logo-buffer" size="18" class="aui-i-action" @click="showTaskModel"/>
        <Dropdown placement="bottom-end" @on-click="onClickAction">
          <Icon type="md-more" size="22" class="aui-i-action" />
          <template #list>
            <DropdownMenu>
              <DropdownItem name="edit">修改</DropdownItem>
              <DropdownItem name="del">删除</DropdownItem>
            </DropdownMenu>
          </template>
        </Dropdown>
      </div>
    </div>
    <div class="aui-i-tasks">
      <!-- <Task v-for="task in tasks" :key="task.id"
        :task="task" :lane="lane" :lanes="lanes"
        :projectId="projectId"
        :inFirstLane="index===0"
        :inLastLane="index===lanes.length-1"
      ></Task> -->
      <draggable
        class="aui-i-lane-task"
        v-model="tasks"
        item-key="id"
        :animation="200"
        group="task"
        :disabled="false"
        ghostClass="ghost"
        chosenClass="chosen"
        handle=".aui-i-lane-task > .aui-task > .aui-i-body"
        @start="drag = true"
        @end="drag = false"
        @sort="onListChange"
    >
      <template #item="{element, index}">
          <Task 
            :task="element"
            :lane="lane"
            :lanes="lanes"
            :projectId="projectId"
            :inFirstLane="index===0"
            :inLastLane="index===lanes.length-1"
          ></Task>
      </template>
      <div class="aui-i-blank"></div>
    </draggable>
    </div>
  </div>
</template>

<script>
import Task from './task';
import LaneService from '@/service/lane_service';
import {events, EventBus} from '@/service/event_bus'
import helper from '@/utils/helper';
import Draggable from 'vuedraggable';

export default {
  props: ['lane', 'projectId', 'kanbanType', 'lanes', 'index'],
  components: {
    'Task': Task,
    Draggable
  },

  created() {
    this.getTasks();

    EventBus.on(events.TASK_SWITCHED, (task, srcLaneId, destLaneId) => {
      if (srcLaneId === this.lane.id) {
        helper.removeFromArray(task, this.tasks, 'id');
      }

      if (destLaneId === this.lane.id) {
        this.tasks.unshift(task);
      }
    });

    EventBus.on(events.TASK_REMOVED, (task, laneId) => {
      if (laneId === this.lane.id) {
        helper.removeFromArray(task, this.tasks, 'id');
      }
    });

    EventBus.on(events.TASK_ADDED, ({taskId, laneId}) => {
      if (laneId === this.lane.id) {
        this.getTasks()
      }
    });
  },

  data() {
    return {
      showLaneModel: false,
      tasks: [],
      style: 'min-height:120px;display: block;'
    }
  },

  computed: {
    className() {
      if (this.index === 0 || this.index === this.lanes.length - 1) {
        return 'aui-i-header';
      } else {
        return 'aui-i-header aui-a-draggable';
      }
    }
  },

  methods: {
    isFull() {
      return this.tasks.length === this.lane.wip;
    },

    getTasks() {
      LaneService.getTasks(this.projectId, 'kanban', this.lane.id).then(data => {
        this.tasks = data['tasks'];
      }).catch(err => {
        this.$Message.error(err.errMsg);
      })
    },

    onListChange(event) {
      LaneService.resort(this.projectId, this.kanbanType, this.lanes).then(() => {
        this.$Message.success('排序完成');
      }).catch(err => {
        console.log(err);
        this.$Message.error('排序失败');
      })
    },

    onClickAction(name) {
      if (name === 'edit') {
        EventBus.emit(events.LANE_EDITING, this.lane, this.kanbanType);
      } else if (name === 'del') {
        this.$Modal.confirm({
          title: '删除泳道',
          content: '<strong>确定要删除该泳道么？</strong><p>请在删除前清理掉泳道中的任务！！！</p>',
          okText: '确认',
          cancelText: '等一下',
          onOk: () => {
            LaneService.deleteLane(this.projectId, this.lane).then(() => {
              this.$emit('laneDeleted', this.lane);
            }).catch(err => {
              this.$Message.error(err.errMsg);
            });
          }
        });
      }
    },
    showTaskModel() {
      EventBus.emit(events.TASK_ADDING, this.lane, this.kanbanType);
    }
  }
}
</script>

<style scoped lang="less">
.ghost {
  visibility: hidden;
}

.aui-lane {
  outline: 0;
  height: 100vh;
  width: 280px;
  flex-shrink: 0;
  padding: 5px;
  margin: 5px;
  border-radius: 5px;
  overflow: auto;

  .aui-i-header {
    display: flex;
    justify-content: space-between;

    .aui-i-title {
      font-size: 16px;
      font-weight: bold;
    }

    .aui-i-action {
      &:hover {
        transform: scale(1.2);
        cursor: auto;
      }
    }
  }

  .aui-a-draggable {
    &:hover {
      cursor: grab;
    }
    &:active {
      cursor: grabbing;
    }
  }

  .aui-i-tasks {
    .aui-i-lane-task {
      min-height: 200px;
      display: block;
    }
  }
}
</style>
