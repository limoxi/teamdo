<template>
  <Modal
      v-model="showModel"
      :title="title"
      class="aui-task-model"
      fullscreen
      @on-visible-change="onVisibleChange"
  >
    <div class="task-model-main">
      <div class="task-info">
        <Form ref="taskForm"
            @submit.prevent
            :model="form"
            :rules="ruleValidate"
            :disabled="this.mode==='view'"
            :label-width="80"
        >
          <FormItem label="任务类型" prop="type">
            <Select v-model="form.type" style="width:180px" aria-label="typeSelector" :disabled="!isCreateMode">
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
          <FormItem label="执行者" prop="assignor">
            <Select v-model="form.assignorId" style="width:180px" aria-label="assignorSelector" filterable>
              <Option v-for="option in projectUserOptions" :value="option.value" :key="option.value">
                {{ option.label }}
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
    <template #footer>
      <Button @click="handleSubmit">确定</Button>
    </template>
  </Modal>
</template>
<script>
import TaskService from '@/service/task_service'
import ProjectService from "@/service/project_service"
import {events, EventBus} from '@/service/event_bus'
import Editor from '@/components/editor/editor'
import LabelSelector from '@/components/label_selector'
import defaultAvatar from '@/images/default-avatar.webp'

export default {
  props: ['show', 'mode', 'task', 'projectId'],
  components: {
    Editor,
    LabelSelector
  },

  data() {
    return {
      form: this.defaultForm(),
      needOptions: [],
      tagOptions: [],
      typeOptions: [{
        'label': '需求',
        'value': 'REQ'
      }, {
        'label': '优化',
        'value': 'OPT'
      }, {
        'label': 'BUG',
        'value': 'BUG'
      }],
      importanceOptions: [
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
      ],
      projectUserOptions: [],
      ruleValidate: {
        name: [
          {required: true, message: '任务标题不能为空', trigger: 'blur'}
        ],
        type: [
          {required: true, message: '请选择任务类型', trigger: 'blur'}
        ],
        importance: [
          {required: true, message: '请选择优先级', trigger: 'blur'}
        ]
      },
      defaultAvatar: defaultAvatar,
      newTagName: ''
    }
  },

  created() {
    this.prepareUsers()
  },

  computed: {
    showModel: {
      get() {
        return this.show;
      },
      set(newValue) {
        this.$emit('update:show', newValue);
      }
    },
    title() {
      let title = '';
      if (this.mode === 'create') {
        title = '添加任务';
      } else {
        title = '详情 - ' + this.task.name;
      }
      return title;
    },
    isViewMode(){
      return this.mode==='view'
    },
    isCreateMode(){
      return this.mode==='create'
    }
  },

  methods: {
    defaultForm() {
      return {
        name: '',
        desc: '',
        importance: '0',
        assignorId: '0',
        tags: []
      }
    },
    onVisibleChange(show){
      if (show && this.task){
        this.form = this.task
        this.form.importance = this.task.importance + ''
        this.form.assignorId = this.task.assignor_id + ''
        console.log(this.form)
      }
    },
    actionDone(eventName, data = undefined) {
      this.showModel = false;
      this.resetForm();
      this.$Message.success('操作成功');
      EventBus.emit(eventName, data);
    },
    onFetchLogs() {

    },
    onAddRemark() {

    },
    onTagSelected(selectedTag){
      console.log(selectedTag)
      if (!this.form.tags) {
        this.form.tags = []
      }
      if (this.form.tags.filter(tag => tag.name === selectedTag.name).length === 0) {
        this.form.tags.push(selectedTag)
      }
    },
    onTagCreated(e){
      const colors = ['#2b85e4', '#19be6b', '#ff9900', '#ed4014', '#17233d']
      let newColor = colors[Math.floor(Math.random() * 5)]
      for (let tag of this.form.tags) {
        if (tag.name === this.newTagName) {
          return false
        }
      }
      this.form.tags.push({
        name: this.newTagName,
        color: colors[Math.floor(Math.random() * 5)]
      })
    },
    onDescChange(desc) {
      this.form.desc = desc;
    },
    handleCloseTag(tagName) {
      this.form.tags = this.form.tags.filter(tag => tag.name !== tagName)
    },
    handleSubmit() {
      this.$refs['taskForm'].validate((valid) => {
        if (valid) {
          const taskData = {
            name: this.form.name.replace(/\s+/g,""),
            desc: this.form.desc,
            importance: this.form.importance * 1,
            assignorId: this.form.assignorId * 1,
            type: this.form.type,
            tags: this.form.tags || []
          }
          if (this.mode === 'create') {
            TaskService.addTask(this.projectId * 1, taskData).then((data) => {
              this.actionDone(events.TASK_ADDED, {
                'taskId': data.id,
                'laneId': data.lane_id
              });
              this.form = this.defaultForm();
            }).catch(err => {
              this.$Message.error(err.errMsg);
            });
          } else {
            taskData.id = this.task.id
            TaskService.updateTask(this.projectId * 1, taskData).then(() => {
              this.actionDone(events.TASK_UNDO);
              this.form = this.defaultForm();
            }).catch(err => {
              this.$Message.error(err.errMsg);
            });
          }
        } else {
          this.$Message.error('请检查填写项');
        }
      })
    },
    resetForm() {
      this.$refs['taskForm'].resetFields();
    },
    prepareUsers(){
      ProjectService.getProjectMembers(this.projectId).then(users => {
        users.forEach(user => {
          this.projectUserOptions.push({
            label: user.nickname,
            value: user.id + ''
          })
        })
      })
    }
  }
}
</script>

<style scoped lang="less">
.aui-task-model {
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
