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
              <DropdownItem name="add">在右边添加</DropdownItem>
              <DropdownItem name="edit">修改</DropdownItem>
              <DropdownItem v-if="!isLastLane" name="del">删除</DropdownItem>
            </DropdownMenu>
          </template>
        </Dropdown>
      </div>
    </div>
    <template v-if="loadingTasks">
      <Skeleton class="aui-i-skeleton"
          loading
          animated
          :title="false"
          :paragraph="{ rows: 4, width: ['20%', '80%', '40%', '20%'] }"
      />
    </template>
    <template v-else>
      <draggable
          :id="nodeId"
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
        <template #item="{element, index}">
          <task-card
              :task="element"
              :lane="lane"
              :lanes="lanes"
              :projectId="projectId"
              :inFirstLane="isFirstLane"
              :inLastLane="isLastLane"
          ></task-card>
        </template>
        <div class="aui-i-blank">asdasdasd</div>
      </draggable>
    </template>

    </div>
</template>

<script>
import TaskCard from './task_card';
import LaneService from '@/service/lane_service';
import {events, EventBus} from '@/service/event_bus'
import helper from '@/utils/helper';
import Draggable from 'vuedraggable';

export default {
  props: ['lane', 'projectId', 'lanes', 'index', 'filters'],
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

    EventBus.on(events.TASK_ADDED, (taskId, laneId) => {
      if (laneId === this.lane.id) {
        this.getTasks()
      }
    });

    EventBus.on(events.TASK_UPDATED, (taskId, laneId) => {
      if (laneId === this.lane.id) {
        this.getTasks()
      }
    });

    EventBus.on(events.REFRESH_LANE_TASKS, () => {
      this.getTasks()
    });
  },

  data() {
    return {
      showLaneModel: false,
      loadingTasks:true,
      tasks: [],
      drag: false,
      hasNext: true
    }
  },
  components: {
    TaskCard,
    Draggable
  },
  watch: {
    filters: {
      handler(filters) {
        this.getTasks(filters)
      },
      deep: true
    }
  },
  computed: {
    nodeId() {
      return `d_l_${this.lane.id}`
    },
    className() {
      if (this.index === 0 || this.index === this.lanes.length - 1) {
        return 'aui-i-header';
      } else {
        return 'aui-i-header aui-a-draggable';
      }
    },
    isFirstLane () {
      if (this.lanes.length === 0) {
        return true
      }
      return this.lanes[0].id === this.lane.id;
    },
    isLastLane () {
      if (this.lanes.length === 0) {
        return true
      }
      return this.lanes[this.lanes.length-1].id === this.lane.id;
    }
  },

  methods: {
    getTasks(filters) {
      LaneService.getTasks(this.projectId, this.lane.id, filters).then(resp => {
        this.tasks = resp['tasks']
        this.loadingTasks = false
      }).catch(err => {
        this.$Message.error(err.errMsg);
      })
    },

    onListChange(event) {
      if (event.from.id === this.nodeId) {
        if (event.from.id !== event.to.id){
          return
        }
      }
      const taskId = event.item.getAttribute('taskId')
      const targetTasks = [...event.to.children]
      let beforeTaskId
      targetTasks.forEach((el, index) => {
        if (el.getAttribute('taskId') === taskId) {
          if (index < targetTasks.length - 1) {
            beforeTaskId = targetTasks[index + 1].getAttribute('taskId')
          }
        }
      })
      LaneService.shuttledTask(this.projectId, parseInt(taskId), this.lane.id, parseInt(beforeTaskId)).then(() => {
          // pass
      }).catch(err => {
        this.$Message.error(err.errMsg);
      })
    },

    onClickAction(name) {
      if (name === 'add') {
        EventBus.emit(events.LANE_ADDING, this.lane)
      } else if (name === 'edit') {
        EventBus.emit(events.LANE_EDITING, this.lane)
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
      EventBus.emit(events.TASK_ADDING);
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
  width: 280px;
  flex-shrink: 0;
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

    .aui-i-action {
      &:hover {
        transform: scale(1.2);
        cursor: auto;
      }
    }
  }

  .aui-i-skeleton{
    margin: 10px 0;
    padding: 10px;
    border-radius: 2px;
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
    overflow-y: scroll;
    height: 100%;
  }
}
</style>
