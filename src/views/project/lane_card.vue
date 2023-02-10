<template>
  <div class="aui-lane">
    <div :class="className">
      <p class="aui-i-title">{{ currLane.name }}&nbsp;∙&nbsp;({{ tasks.length }}/{{ currLane.wip || '∞' }})</p>
      <div>
        <!--        <Icon v-if="index===0" type="logo-buffer" size="18" class="aui-i-action" @click="showTaskModel"/>-->
        <Dropdown placement="bottom-end" @on-click="onClickAction">
          <Icon type="md-more" size="22" class="aui-i-action"/>
          <template #list>
            <DropdownMenu>
              <DropdownItem name="add">在右边添加</DropdownItem>
              <DropdownItem name="edit">修改</DropdownItem>
              <DropdownItem v-if="!currLane.isLast" name="del">删除</DropdownItem>
            </DropdownMenu>
          </template>
        </Dropdown>
      </div>
    </div>
    <template v-if="currLane.loadingTasks">
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
              :lane="currLane"
              :projectId="projectId"
          ></task-card>
        </template>
      </draggable>
    </template>
  </div>
</template>

<script setup>
import TaskCard from './task_card';
import Draggable from 'vuedraggable';
import {computed, inject, onBeforeUnmount, onDeactivated, ref, watch} from "vue";
import {Modal} from "view-ui-plus";
import {useModalStore} from "@/store"

const modalStore = useModalStore()

const props = defineProps(['laneId', 'projectId', 'index', 'filters'])

const project = inject('project')
const currLane = computed(() => {
  return project.value.getLane(props.laneId)
})
currLane.value.loadTasks()

const tasks = computed(() => {
  return currLane.value.tasks
})

let drag = ref(false)

watch(() => props.filters, (newV, oldV) => {
  getTasks(newV)
}, {deep: true})


const nodeId = computed(() => `p_${props.projectId}_d_l_${props.laneId}`)
const className = computed(() => {
  if (currLane.value.isFirst || currLane.value.isLast) {
    return 'aui-i-header';
  } else {
    return 'aui-i-header aui-a-draggable';
  }
})

const getTasks = (filters) => {
  currLane.value.loadTasks(filters)
}

const onListChange = (event) => {
  if (event.from.id === nodeId.value) {
    if (event.from.id !== event.to.id) {
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

  const sps = event.from.id.split('_')
  const sourceLaneId = parseInt(sps[sps.length - 1])
  const targetLaneId = props.laneId
  project.value.shuttleTask(
      sourceLaneId, targetLaneId,
      parseInt(taskId), parseInt(beforeTaskId), false)
}

const onClickAction = (name) => {
  if (name === 'add') {
    modalStore.show('laneModal', {
      'projectId': props.projectId,
      'lane': currLane.value,
      'mode': 'create'
    })
  } else if (name === 'edit') {
    modalStore.show('laneModal', {
      'projectId': props.projectId,
      'lane': currLane.value,
      'mode': 'update'
    })
  } else if (name === 'del') {
    Modal.confirm({
      title: '删除泳道',
      content: '<strong>确定要删除该泳道么？</strong><p>请在删除前清理掉泳道中的任务！！！</p>',
      okText: '确认',
      cancelText: '等一下',
      onOk: () => {
        project.value.deleteLane(props.laneId)
      }
    });
  }
}

const showTaskModel = () => {
  modalStore.show('taskModal', {
    projectId: props.projectId
  })
}
</script>

<style scoped lang="less">
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
