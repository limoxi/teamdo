<template>
  <Modal
      v-model="showModel"
      :title="title"
      style="top:10%"
      class="aui-task-model"
      width="80%"
      scrollable
      footer-hide
      :mask-closable="false"
      :closable="false"
  >
    <div class="aui-i-action-bar">
      <Icon v-if="mode==='mod'" class="aui-i-action-btn delete" type="md-trash" @click="handleDelete" />
      <Icon type="md-done-all" class="aui-i-action-btn save" @click="handleSubmit" />
      <Icon type="md-close" class="aui-i-action-btn close" @click="close" />
    </div>
      <Form ref="taskForm"
            @submit.prevent
            :model="form"
            :rules="ruleValidate"
            :disabled="mode==='view'"
            :label-width="80"
        >
          <FormItem label="任务类型" prop="type" style="float: left">
            <Select v-model="form.type" style="width:180px" aria-label="typeSelector">
              <Option v-for="option in taskTypeOptions" :value="option.value" :key="option.value">
                {{ option.label }}
              </Option>
            </Select>
          </FormItem>
          <FormItem label="优先级" prop="importance" style="display: inline-block">
            <Select v-model="form.importance" style="width:180px" aria-label="importanceSelector">
              <Option v-for="option in importanceOptions" :value="option.value" :key="option.value">
                {{ option.label }}
              </Option>
            </Select>
          </FormItem>
          <FormItem label="用户故事" prop="name">
            <Input
                type="textarea"
                :autosize="{minRows: 1,maxRows: 3}"
                show-word-limit
                :maxlength="48"
                v-model="form.name"
                placeholder="某人可以在何时何处做某事" style="width: 90%"></Input>
          </FormItem>
          <FormItem label="执行者" prop="assignorId">
            <Select v-model="form.assignorId" style="width:180px" aria-label="assignorSelector" filterable>
              <Option v-for="pu in project.users" :value="pu.id + ''" :key="pu.id">
                <img class="aui-user-selector-avatar" :src="pu.avatar || defaultAvatar" alt="avatar"/>
                {{ pu.nickname }}
              </Option>
            </Select>
            <span v-if="!!task" class="aui-i-users">
              <span>参与者({{userCount}})&nbsp;&nbsp;</span>
              <Tooltip :content="user.nickname" v-for="user in task.users" :key="user.id">
                <Avatar :src="user.avatar||defaultAvatar" size="small"></Avatar>
              </Tooltip>
            </span>
          </FormItem>
          <FormItem label="标签" prop="tags">
            <Tag v-for="tag in form.tags" :key="tag.id"
                 :color="tag.color" type="dot" closable
                 @on-close="handleCloseTag(tag)"
            >
              {{ tag.name }}
            </Tag>
            <Select
                v-model="selectedTagId"
                filterable
                clearable
                placeholder="添加标签"
                @on-select="handleSelectTag"
                class="aui-i-tagFilter"
            >
              <Option v-for="tag in project.tags" :value="tag.id" :key="tag.id">
                <Badge :color="tag.color" :text="tag.name" />
              </Option>
            </Select>
          </FormItem>
          <FormItem label="描述" prop="desc">
            <editor v-model:content="form.desc" :readonly="mode==='view'"></editor>
          </FormItem>
    </Form>
  </Modal>
</template>
<script setup>
import TaskService from '@/service/task_service'
import {events, EventBus} from '@/service/event_bus'
import Editor from '@/components/editor/editor'
import defaultAvatar from '@/images/default-avatar.webp'
import {ref, computed, watch, inject} from "vue";
import {Message, Modal} from "view-ui-plus";
import {importanceOptions, taskTypeOptions} from '@/utils/constant'
import helper from '@/utils/helper'

const ruleValidate = {
  name: [
    {required: true, message: '任务标题不能为空', trigger: 'blur'}
  ],
  type: [
    {required: true, message: '请选择任务类型', trigger: 'blur'}
  ],
  importance: [
    {required: true, message: '请选择优先级', trigger: 'blur'}
  ]
}

const props = defineProps({
  show: Boolean,
  mode: String,
  task: Object,
  laneId: Number,
  projectId: Number
})
const emit = defineEmits(['update:show'])

let showModel = computed({
  get() {
    return props.show;
  },
  set(newValue) {
    emit('update:show', newValue);
  }
})

const userCount = computed(() => {
  if(props.task && props.task.users){
    return props.task.users.length
  }
  return 0
})

const title = computed(() => {
  let title = '';
  if (props.mode === 'create') {
    title = '添加任务';
  } else {
    title = '任务详情';
  }
  return title;
})

let defaultForm = {
  type: 'REQ',
  name: '',
  importance: '0',
  assignorId: '0',
  tags: [],
  desc: ''
}

const project = inject('project').value
const form = ref(defaultForm)
const taskForm = ref(null)

const projectTags = computed(() => {
  return project.tags
})
let selectedTagId = ref('')

watch(props, (newVal, oldVal) => {
  selectedTagId.value = ''
  if (newVal.mode === 'create'){
    taskForm.value.resetFields()
    return
  }
  const task = newVal.task
  form.value.type = task.type
  form.value.name = task.name
  form.value.importance = task.importance + ''
  form.value.assignorId = task.assignor_id + ''
  form.value.tags = task.tags || []
  form.value.desc = task.desc
})

const handleSelectTag = (selectedTag) => {
  const tagId = selectedTag.value
  if(form.value.tags.filter(tag => tag.id === tagId).length > 0) return
  const tag = projectTags.value.filter(tag => tag.id===tagId)[0]
  form.value.tags.push(tag)
  selectedTagId.value = ''
}

const close = () => {
  showModel.value = false
}

const handleCloseTag = (tag) => {
  helper.removeFromArray(tag, form.value.tags, 'id');
}

const actionDone = (eventName, ...data) => {
  EventBus.emit(eventName, ...data);
  close()
  Message.success('操作成功');
}

const handleSubmit = () => {
  taskForm.value.validate((valid) => {
    if (valid) {
      const taskData = {
        type: form.value.type,
        name: form.value.name.replace(/\s+/g,""),
        desc: form.value.desc,
        importance: form.value.importance * 1,
        assignorId: form.value.assignorId * 1,
        tagIds: form.value.tags.map(tag => {
          return tag.id
        })
      }
      if (props.mode === 'create') {
        TaskService.addTask(props.projectId * 1, taskData).then((data) => {
          actionDone(events.TASK_ADDED, data.id, data.lane_id)
        }).catch(err => {
          Message.error(err.errMsg);
        });
      } else {
        taskData.id = props.task.id
        TaskService.updateTask(props.projectId * 1, taskData).then(() => {
          actionDone(events.TASK_UPDATED, props.task.id, props.task.lane_id);
        }).catch(err => {
          Message.error(err.errMsg);
        });
      }
    }
  })
}

const handleDelete = () => {
  Modal.confirm({
    title: '删除任务',
    content: `'<strong>确定要删除任务【${props.task.name}】么？</strong>'`,
    okText: '确认',
    cancelText: '再想想',
    onOk: () => {
      TaskService.deleteTask(props.projectId * 1, props.task).then(() => {
        actionDone(events.TASK_REMOVED, props.task, props.task.lane_id)
      }).catch(err => {
        Message.error(err.errMsg);
      });
    }
  });
}

</script>

<style scoped lang="less">
.aui-task-model {
  .aui-i-tagFilter{
    width: 150px;
  }
  .aui-i-users{
    margin-left: 40px;
  }
  .aui-i-action-bar{
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 20px;

    .aui-i-action-btn{
      margin-left: 10px;
      cursor: pointer;
    }

    .delete:hover{
      transform: scale(1.1);
      color: indianred;
    }

    .save:hover{
      transform: scale(1.1);
      color: #19be6b;
    }

    .close:hover{
      transform: scale(1.1);
      color: black;
    }
  }
}

</style>
