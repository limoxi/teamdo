<template>
  <Modal
      v-model="showModel"
      :title="title"
      class="aui-task-model"
      fullscreen
      footer-hide
  >
    <template #close>
      <ButtonGroup>
        <Button type="text" @click="close">关闭</Button>
        <Button v-if="mode==='mod'" type="text" class="aui-btn-danger-text" @click="handleDelete">删除</Button>
        <Button type="text" @click="handleSubmit">确定</Button>
      </ButtonGroup>
    </template>
    <div class="task-model-main">
      <div class="task-info">
        <Form ref="taskForm"
            @submit.prevent
            :model="form"
            :rules="ruleValidate"
            :disabled="mode==='view'"
            :label-width="80"
        >
          <FormItem label="任务类型" prop="type">
            <Select v-model="form.type" style="width:180px" aria-label="typeSelector">
              <Option v-for="option in typeOptions" :value="option.value" :key="option.value">
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
          <FormItem label="优先级" prop="importance">
            <Select v-model="form.importance" style="width:180px" aria-label="importanceSelector">
              <Option v-for="option in importanceOptions" :value="option.value" :key="option.value">
                {{ option.label }}
              </Option>
            </Select>
          </FormItem>
          <FormItem label="执行者" prop="assignorId">
            <Select v-model="form.assignorId" style="width:180px" aria-label="assignorSelector" filterable>
              <Option v-for="pu in projectUsers" :value="pu.id + ''" :key="pu.id">
                <img class="aui-user-selector-avatar" :src="pu.avatar || defaultAvatar" alt="avatar"/>
                {{ pu.nickname }}
              </Option>

            </Select>
          </FormItem>
          <FormItem label="标签" prop="tags">
            <Tag v-for="(tag, index) in form.tags" :key="index" :color="tag.color" closable @on-close="handleCloseTag(tag.name)">{{ tag.name }}</Tag>
            <Poptip placement="bottom" width="200">
              <a>添加标签</a>
              <template #content>
               <label-selector :currentTags="form.tags" @on-select="onTagSelected"></label-selector>
                <!-- <Input v-model="newTagName" @on-enter="onTagCreated" /> -->
              </template>
            </Poptip>
          </FormItem>
          <FormItem label="描述" prop="desc">
            <editor v-if="showModel" v-model:content="form.desc" :readonly="mode==='view'"></editor>
          </FormItem>
        </Form>
      </div>
      <div class="task-log">
        <div class="task-header">
          <span class="task-log-title">参与者{{ task.users ? task.users.length : 0 }}</span>
          <div class="aui-i-users">
            <div v-for="user in task.users" :key="user.id" style="margin-right: 5px">
              <Tooltip :content="user.nickname" placement="top">
                <Avatar :src="user.avatar || defaultAvatar" :size="user.is_assignor ? 'large' : 'default'"></Avatar>
              </Tooltip>
            </div>
          </div>
        </div>
        <div class="task-log-list">
          <ul>
            <li>
              <span>创建了任务</span>
              <span>周五</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </Modal>
</template>
<script setup>
import TaskService from '@/service/task_service'
import ProjectService from "@/service/project_service"
import {events, EventBus} from '@/service/event_bus'
import Editor from '@/components/editor/editor'
import LabelSelector from '@/components/label_selector'
import defaultAvatar from '@/images/default-avatar.webp'
import {ref, computed, onMounted, watch} from "vue";
import {Message, Modal} from "view-ui-plus";

const typeOptions = [{
  'label': '需求',
  'value': 'REQ'
}, {
  'label': '优化',
  'value': 'OPT'
}, {
  'label': 'BUG',
  'value': 'BUG'
}]
const importanceOptions = [
  {
    'label': '1(一般)',
    'value': '1'
  }, {
    'label': '2',
    'value': '2'
  }, {
    'label': '3',
    'value': '3'
  }, {
    'label': '4(紧急)',
    'value': '4'
  }, {
    'label': '5',
    'value': '5'
  }, {
    'label': '6',
    'value': '6'
  }, {
    'label': '7(非常紧急)',
    'value': '7'
  }, {
    'label': '8',
    'value': '8'
  }, {
    'label': '9',
    'value': '9'
  }
]
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

const title = computed(() => {
  let title = '';
  if (props.mode === 'create') {
    title = '添加任务';
  } else {
    title = '详情 - ' + props.task.name;
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

const form = ref(defaultForm)
const taskForm = ref(null)

const projectUsers = ref([])
let newTagName = ref('')

watch(props, (newVal, oldVal) => {
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

onMounted(() => {
  getProjectUsers()
})

const getProjectUsers = () => {
  ProjectService.getProjectMembers(props.projectId).then(users => {
    projectUsers.value = users
  })
}

const close = () => {
  showModel.value = false
}

const handleCloseTag = (tagName) => {
  form.value.tags = form.value.tags.filter(tag => tag.name !== tagName)
}

const actionDone = (eventName, ...data) => {
  EventBus.emit(eventName, ...data);
  close()
  Message.success('操作成功');
}

const onTagSelected = (selectedTag) => {
  if (form.value.tags.filter(tag => tag.name === selectedTag.name).length === 0) {
    form.value.tags.push(selectedTag)
  }
}

const onTagCreated = (e) => {
  const colors = ['#2b85e4', '#19be6b', '#ff9900', '#ed4014', '#17233d']
  let newColor = colors[Math.floor(Math.random() * 5)]
  for (let tag of form.value.tags) {
    if (tag.name === newTagName.value) {
      return false
    }
  }
  form.value.tags.push({
    name: newTagName.value,
    color: colors[Math.floor(Math.random() * 5)]
  })
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
        tags: form.value.tags || []
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
  .aui-btn-danger-text{
    &:hover{
      color: indianred;
    }
  }
  .task-model-main{
    width: 100%;
    height: 100%;
    overflow-y: auto;
    display: flex;
    .task-info{
      flex: 1;
    }
    .task-log{
      width: 35%;
      border-left: 1px solid #ccc;
      // padding: 0 10px;
      .task-header{
        padding: 0 10px;
        .task-log-title{
          margin-bottom: 10px;
          display: block;
        }
        padding-bottom: 15px;
        border-bottom: 1px solid #ccc;
        .aui-i-users {
          display: flex;
          align-items: center;
        }
      }
      .task-log-list{
        padding: 0 10px;
        margin-top: 20px;
        ul {
          width: 100%;
          li{
            list-style: none;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
        }
      }
    }
  }
}

</style>
