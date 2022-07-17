<template>
  <div class="aui-task-expand">
    <Card v-for="task in subTasks" :key="task.id" class="aui-i-task">
      <p slot="title">
        <Icon type="ios-paper"></Icon>
        任务&nbsp;∙&nbsp;{{ task.name }}
      </p>
      <Button slot="extra" icon="md-qr-scanner" class="aui-icon-scale" @click="onClickExpand(task)"></Button>
      <Tag color="primary">{{ task.elapsed_time || 0 }}</Tag>
      <editor :readonly="true" v-model:content="task.desc"></editor>
    </Card>
  </div>
</template>

<script>
import TaskService from '@/service/task_service';
import Editor from '@/components/editor/editor';
import {events, EventBus} from '@/service/event_bus'

export default {
  props: ['row', 'projectId'],
  components: {
    Editor,
  },

  data() {
    return {
      subTasks: this.row.sub_tasks,
      parent: this.row
    }
  },
  methods: {
    onClickExpand(selectedTask) {
      TaskService.getTask(this.projectId, selectedTask.id).then(task => {
        EventBus.emit(events.TASK_EXPANDED, task);
      }).catch(err => {
        this.$Message.error(err.errMsg);
      });
    }
  }
}
</script>

<style lang="less" scoped>
.aui-task-expand {
  display: flex;
  justify-content: flex-start;

  margin: -15px 0;

  .aui-i-task {
    width: 280px;
    margin: 0 5px;

    img {
      width: 40px;
      border-radius: 40px;
    }
  }
}
</style>
