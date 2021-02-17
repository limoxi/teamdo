<template>
  <Modal
      v-model="showModel"
      :title="title"
      width="1020"
      class="aui-task-model"
      @on-visible-change="onVisibleChange"
  >
    <Form ref="taskForm" :model="form" :rules="ruleValidate" :disabled="this.mode==='view'" :label-width="80">
      <FormItem label="名称" prop="name">
        <Input v-model="form.name" placeholder="某人可以做某事" style="width: 50%"></Input>
      </FormItem>
<!--        <FormItem label="关联需求" prop="need_id" v-show="this.mode === 'create'">-->
<!--          <Select v-model="form.need_id" style="width:180px" aria-label="needSelector">-->
<!--            <Option v-for="need in needOptions" :value="need.id" :key="need.id">-->
<!--              {{ need.name }}-->
<!--            </Option>-->
<!--          </Select>-->
<!--        </FormItem>-->
      <FormItem label="优先级" prop="importance">
        <Select v-model="form.importance" style="width:180px" aria-label="importanceSelector">
          <Option v-for="option in importanceOptions" :value="option.value" :key="option.value">
            {{ option.label }}
          </Option>
        </Select>
      </FormItem>
      <FormItem label="故事点" prop="NUT">
        <InputNumber :max="6" :min="1" v-model="form.NUT"></InputNumber>
      </FormItem>
      <FormItem label="描述">
        <editor @onUpdate="onDescChange" :content="!!task? task.desc: ''" scene="task" :readonly="mode==='view'"></editor>
      </FormItem>
    </Form>
    <Button slot="footer" @click="handleSubmit">确定</Button>
  </Modal>
</template>
<script>
import TaskService from '@/service/task_service';
import events from '@/service/global_events';
import Editor from '@/components/editor_v2/editor';

export default {
  props: ['show', 'mode', 'task', 'projectId'],
  components: {
    Editor,
  },
  data() {
    return {
      form: this.defaultForm(),
      needOptions: [],
      tagOptions: [],
      editor: {
        menuItems: [
          'bold',
          'italic',
          'strike',
          'underline',
          'ordered_list',
          'bullet_list',
          'horizontal_rule',
          'blockquote',
          'code_block',
          'heading-1',
          'heading-2',
          'heading-3',
          'paragraph',
          'image',
          'undo',
          'redo',
        ]
      },
      importanceOptions: [{
        'label': '1(一般)',
        'value': 1
      }, {
        'label': '2',
        'value': 2
      }, {
        'label': '3',
        'value': 3
      }, {
        'label': '4(紧急)',
        'value': 4
      }, {
        'label': '5',
        'value': 5
      }, {
        'label': '6',
        'value': 6
      }, {
        'label': '7(非常紧急)',
        'value': 7
      }, {
        'label': '8',
        'value': 8
      }, {
        'label': '9',
        'value': 9
      }],
      ruleValidate: {
        name: [
          {required: true, message: '任务标题不能为空', trigger: 'blur'}
        ]
      }
    }
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
        title = '添加用户故事';
      } else if (this.mode === 'addSub') {
        title = '添加子任务';
      } else {
        title = '详情 - ' + this.task.name;
      }
      return title;
    }
  },
  methods: {
    defaultForm() {
      return {
        name: '',
        desc: {},
        importance: 0,
        NUT: 1,
        need_id: 0
      }
    },
    onVisibleChange(show){
      if (show && this.task){
        this.form = this.task;
      }
    },
    actionDone(eventName) {
      this.showModel = false;
      this.resetForm();
      this.$Message.success('操作成功');
      this.$emit(eventName);
    },
    onFetchLogs() {

    },
    onAddRemark() {

    },
    onDescChange(desc) {
      this.form.desc = desc;
    },
    handleSubmit() {
      this.$refs['taskForm'].validate((valid) => {
        if (valid) {
          if (this.mode === 'create') {
            TaskService.addTask(this.projectId, this.form).then(() => {
              this.actionDone('taskAdded');
              this.form = this.defaultForm();
            }).catch(err => {
              this.$Message.error(err.errMsg);
            });
          } else if (this.mode === 'addSub') {
            TaskService.addSubTask(this.projectId, this.form, this.task).then(() => {
              this.actionDone('taskAdded');
              window.EventBus.$emit(events.SUB_TASK_ADDED);
              this.form = this.defaultForm();
            }).catch(err => {
              this.$Message.error(err.errMsg);
            });
          } else {
            TaskService.updateTask(this.projectId, this.form).then(() => {
              this.actionDone('taskUpdated');
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
    }
  }
}
</script>

<style scoped lang="less">
.aui-task-model {
}

</style>
