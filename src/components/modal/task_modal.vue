<template>
  <Modal
      v-model="taskModal.show"
      style="top:8%"
      class="aui-task-model"
      width="65%"
      :lock-scroll="true"
      footer-hide
      :mask-closable="false"
      :closable="false"
  >
    <template #header>
      <div class="aui-i-title">{{title}}</div>
      <div class="aui-i-action-bar">
        <Icon v-if="!isCreateMode" class="aui-i-action-btn delete" type="md-trash" @click="handleDelete" />
        <Icon type="md-done-all" class="aui-i-action-btn save" @click="handleSubmit" />
        <Icon type="md-close" class="aui-i-action-btn close" @click="close" />
      </div>
    </template>
      <Form ref="taskForm"
            @submit.prevent
            :model="form"
            :rules="ruleValidate"
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
          <FormItem label="故事点" prop="sp">
            <InputNumber
                v-model="form.sp"
                :max="28"
                :min="0"
                :step="1"
                :precision="0"
            ></InputNumber>
            <span class="aui-i-spRemark">
              <Icon type="md-alert" />
              故事点是一个相对数值，1个故事点可视为最多半天工作量
            </span>
          </FormItem>
          <FormItem label="执行者" prop="assignorId">
            <Select v-model="form.assignorId" style="width:180px" aria-label="assignorSelector" filterable>
              <Option v-for="pu in project.users" :value="pu.id + ''" :key="pu.id">
                <img class="aui-user-selector-avatar" :src="pu.avatar || defaultAvatar" alt="avatar"/>
                {{ pu.nickname }}
              </Option>
            </Select>
            <span v-if="userCount > 0" class="aui-i-users">
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
          <FormItem label="详细描述" prop="desc">
            <Editor ref="editorInst" :content="form.desc" />
          </FormItem>
    </Form>
  </Modal>
</template>
<script setup>
import TaskService from '@/service/task_service'
import Editor from '@/components/editor/editor'
import defaultAvatar from '@/images/default-avatar.webp'
import {ref, computed, inject} from "vue";
import {Message, Modal} from "view-ui-plus";
import {importanceOptions, taskTypeOptions} from '@/utils/constant'
import helper from '@/utils/helper'
import {useModalStore} from "@/store"
import {storeToRefs} from "pinia";

const modalStore = useModalStore()
const {taskModal} = storeToRefs(modalStore)
const task = computed(() => taskModal.value.task)
const isCreateMode = computed(() => !task.value)

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

const emit = defineEmits(['taskUpdated'])

const userCount = computed(() => {
  return (task.value?.users || []).length
})

const title = computed(() => {
  return task.value ? '任务详情' : '添加任务'
})

const project = inject('project').value
let form = ref({
  type: 'REQ',
  name: '',
  importance: '0',
  sp: 0,
  assignorId: '0',
  tags: [],
  desc: ''
})
const taskForm = ref(null)
const editorInst = ref()

const projectTags = computed(() => {
  return project.tags
})
let selectedTagId = ref('')

modalStore.$subscribe((_, state) => {
  const store = state.taskModal
  if (store.show) {
    form.value.type = store.task?.type || 'REQ'
    form.value.name = store.task?.name || ''
    form.value.importance = (store.task?.importance || 0) + ''
    form.value.sp = store.task?.sp || 0
    form.value.assignorId = (store.task?.assignor_id || 0) + ''
    form.value.tags = store.task?.tags || []
    form.value.desc = store.task?.desc || ''

    editorInst.value.resetContent(store.task?.desc || '')
    selectedTagId.value = ''
  }
})

const handleSelectTag = (selectedTag) => {
  const tagId = selectedTag.value
  if(form.value.tags.filter(tag => tag.id === tagId).length > 0) return
  const tag = projectTags.value.filter(tag => tag.id===tagId)[0]
  form.value.tags.push(tag)
  selectedTagId.value = ''
}

const close = () => {
  modalStore.close('taskModal')
}

const handleCloseTag = (tag) => {
  helper.removeFromArray(tag, form.value.tags, 'id');
}

const actionDone = (...data) => {
  emit('taskUpdated', ...data)
  Message.success('操作成功');
  close()
}

const handleSubmit = () => {
  taskForm.value.validate((valid) => {
    if (valid) {
      const taskData = {
        type: form.value.type,
        name: form.value.name.replace(/\s+/g,""),
        desc: editorInst.value.getContent(),
        importance: form.value.importance * 1,
        sp: form.value.sp,
        assignorId: form.value.assignorId * 1,
        tagIds: form.value.tags.map(tag => {
          return tag.id
        })
      }
      if (isCreateMode.value) {
        TaskService.addTask(project.id, taskData).then((data) => {
          actionDone(data.id, data.lane_id)
        }).catch(err => {
          Message.error(err.errMsg);
        });
      } else {
        taskData.id = task.value.id
        TaskService.updateTask(project.id * 1, taskData).then(() => {
          actionDone(task.value.id, task.value.lane_id);
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
    content: `'<strong>确定要删除任务【${task.value.name}】么？</strong>'`,
    okText: '确认',
    cancelText: '再想想',
    onOk: () => {
      TaskService.deleteTask(project.id, task.value).then(() => {
        actionDone(task.value.id, task.value.lane_id)
      }).catch(err => {
        Message.error(err.errMsg);
      });
    }
  });
}

</script>

<style lang="less">
.aui-task-model {
  .aui-i-spRemark{
    margin-left: 10px;
    color: darkgrey;
    font-size: smaller;
    i{
      vertical-align: baseline;
    }
  }
  .ivu-modal-header{
    position: sticky;
    top: 0;
    background: white;
    z-index: 1;
    border-radius: 10px 10px 0 0;
  }

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