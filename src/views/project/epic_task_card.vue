<template>
  <Card class="aui-epic-task">
    <template #title>
      <span><i>#</i>{{ task.id }}</span> {{ task.name }}
    </template>
    <template #extra>
      <span class="aui-i-action">
        <Button size="large" type="text" icon="md-create" @click="onEdit"></Button>
        <Button size="large" type="text" icon="md-trash" @click="onDelete"></Button>
      </span>
    </template>
    <div class="aui-i-content">
      <Space>
        <span><Icon type="md-alarm"/>{{ task.expectedFinishedAt }}</span>
        <Tag color="#19be6b">{{ task.fromWhere }}</Tag>
        <Tag :color="getImportanceColor(task.importance)">
          {{ `${getImportanceDesc(task.importance)}(${task.importance})` }}
        </Tag>
        <span>
          <Icon type="md-alarm"/>
          {{ task.expectedFinishedAt }}
        </span>
      </Space>
      <Tooltip :content="`维护人: ${task.getCreator().name}`" placement="right">
        <Avatar :src="task.getCreator().avatar"/>
      </Tooltip>
      <p class="aui-i-time">{{ task.createdAt }}</p>
    </div>
  </Card>

</template>

<script setup>
import {Button, Message, Modal} from "view-ui-plus";
import {inject} from "vue";
import {useModalStore} from '@/store'
import EpicTaskService from '@/business/epic_task_service';
import {getImportanceColor, getImportanceDesc} from '@/utils/constant';

const modalStore = useModalStore()
const projectId = inject('projectId')
const project = inject('project')
const props = defineProps(['task'])

const onEdit = (e) => {
  e.stopPropagation();
  modalStore.show('epicModal', {
    projectId: projectId,
    task: props.task
  })
}

const onDelete = (e) => {
  e.stopPropagation();
  Modal.confirm({
    title: '删除需求',
    content: '<strong>确定要删除该需求么？</strong><p>删除后该需求和任务的关联将被解除</p>',
    okText: '确认',
    cancelText: '再想想',
    onOk: () => {
      EpicTaskService.deleteEpicTask(projectId, props.task.id).then(() => {
        emit('onDelete')
      }).catch(err => {
        Message.error(err.errMsg)
      });
    }
  });
}
</script>

<style scoped lang="less">
.aui-epic-task {
  &:hover {
    .aui-i-action {
      display: inline-block;
    }
  }

  margin: 5px;

  .ivu-card-head {
    display: flex;
    justify-content: flex-start;
    align-items: center;

    .aui-i-name {
      font-size: 18px;
      margin-right: 8px;
    }

    .ivu-avatar {
      transform: scale(0.7);
      margin-top: -5px;
    }
  }

  .ivu-card-extra {
    top: 5px !important;
  }

  .aui-i-action {
    display: none;

    .ivu-btn-icon-only .ivu-btn-large {
      font-size: 16px;
    }
  }

  .ivu-avatar {
    border: none !important;
  }

  .aui-i-time {
    text-align: right;
  }
}
</style>
