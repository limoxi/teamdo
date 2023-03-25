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
      <div class="aui-i-title">{{ title }}</div>
      <div class="aui-i-action-bar">
        <Icon v-if="!isCreateMode" class="aui-i-action-btn delete" type="md-trash" @click="handleDelete"/>
        <Icon type="md-done-all" class="aui-i-action-btn save" @click="handleSubmit"/>
        <Icon type="md-close" class="aui-i-action-btn close" @click="close"/>
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
      <FormItem v-if="form.type==='BUG' && form.relatedTaskId > 0" label="关联任务" prop="relatedTaskId">
        <Input style="width: 180px" disabled :value="form.relatedTaskId">
          <template #prefix>
            <Icon type="ios-link"/>
          </template>
        </Input>
      </FormItem>
      <FormItem :label="nameLabel" prop="name">
        <Input
            type="textarea"
            :autosize="{minRows: 1,maxRows: 3}"
            show-word-limit
            :maxlength="48"
            v-model="form.name"
            :placeholder="form.type==='REQ'?'某人可以在何时何处做某事': ''" style="width: 90%"></Input>
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
              <Icon type="md-alert"/>
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
              <span>参与者({{ userCount }})&nbsp;&nbsp;</span>
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
          <Option v-for="tag in project.getTagsByBiz('normal_task')" :value="tag.id" :key="tag.id">
            <Badge :color="tag.color" :text="tag.name"/>
          </Option>
        </Select>
      </FormItem>
      <FormItem label="详细描述" prop="desc">
        <Editor ref="editorInst" :content="form.desc"/>
      </FormItem>
    </Form>
  </Modal>
</template>
<script setup>
import Editor from '@/components/editor/editor'
import defaultAvatar from '@/assets/images/default-avatar.webp'
import {computed, inject, ref} from "vue";
import {Message, Modal} from "view-ui-plus";
import {importanceOptions, taskTypeOptions} from '@/utils/constant'
import helper from '@/utils/helper'
import {useModalStore} from "@/store"
import {storeToRefs} from "pinia";

const project = inject('project')
const projectId = computed(() => project.value.id)

const modalStore = useModalStore()
const {taskModal} = storeToRefs(modalStore)
const task = computed(() => taskModal.value.task)
const isCreateMode = computed(() => !task.value)
let submitting = false

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

const userCount = computed(() => {
  return (task.value?.users || []).length
})

const title = computed(() => {
  let t = ''
  if (taskModal.value.relatedTask) {
    t = '添加关联任务'
  } else {
    t = task.value ? '任务详情' : '添加任务'
  }

  if (taskModal.value.relatedTask && taskModal.value.relatedTask.isEpicTask()) {
    t += ` · #${taskModal.value.relatedTask.id}`
  }

  return t
})

const nameLabel = computed(() => {
  switch (form.value.type) {
    case 'REQ':
      return '用户故事'
    case 'BUG':
      return '问题描述'
    case 'OPT':
      return '优化概要'
  }
})

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

let selectedTagId = ref('')

const emit = defineEmits(['onAdd', 'onUpdate', 'onDelete'])

modalStore.$subscribe((_, state) => {
  const store = state.taskModal
  if (store.show) {
    form.value.type = store.task?.type || 'REQ'
    form.value.name = store.task?.name || ''
    form.value.importance = (store.task?.importance || store.relatedTask?.importance || 0) + ''
    form.value.sp = store.task?.sp || 0
    form.value.assignorId = (store.task?.assignorId || store.relatedTask?.assignorId || 0) + ''
    form.value.tags = store.task?.tags || []
    form.value.desc = store.task?.desc || ''

    editorInst.value.resetContent(store.task?.desc || '')
    selectedTagId.value = ''
  }
})

const handleSelectTag = (selectedTag) => {
  const tagId = selectedTag.value
  if (form.value.tags.filter(tag => tag.id === tagId).length > 0) return
  const tag = project.value.tags.filter(tag => tag.id === tagId && tag.biz_code === 'normal_task')[0]
  form.value.tags.push(tag)
  selectedTagId.value = ''
}

const close = () => {
  submitting = false
  modalStore.close('taskModal')
}

const handleCloseTag = (tag) => {
  helper.removeFromArray(tag, form.value.tags, 'id');
}

const actionDone = () => {
  Message.success('操作成功');
  close()
}

const handleSubmit = () => {
  // if (submitting) return
  submitting = true
  taskForm.value.validate((valid) => {
    if (valid) {
      const taskData = {
        type: form.value.type,
        name: form.value.name.replace(/\s+/g, ""),
        desc: editorInst.value.getContent(),
        importance: form.value.importance * 1,
        sp: form.value.sp,
        assignorId: form.value.assignorId * 1,
        relatedTaskId: taskModal.value.relatedTask?.id || 0,
        tagIds: form.value.tags.map(tag => {
          return tag.id
        })
      }
      if (isCreateMode.value) {
        project.value.addTask(taskData).then((newTask) => {
          emit('onAdd', newTask)
          actionDone()
        }).finally(() => {
          submitting = false
        })
      } else {
        taskData.id = task.value.id
        project.value.updateTask(taskData).then((updatedTask) => {
          emit('onUpdate', updatedTask)
          actionDone()
        }).catch(err => {
          Message.error(err.errMsg);
        }).finally(() => {
          submitting = false
        })
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
      project.value.deleteTask(task.value.id).then(() => {
        emit('onDelete', task.value)
        actionDone()
      })
    }
  });
}

</script>

<style lang="less">
.aui-task-model {
  .aui-i-spRemark {
    margin-left: 10px;
    color: darkgrey;
    font-size: smaller;

    i {
      vertical-align: baseline;
    }
  }

  .ivu-modal-header {
    position: sticky;
    top: 0;
    background: white;
    z-index: 1;
    border-radius: 10px 10px 0 0;
  }

  .aui-i-tagFilter {
    width: 150px;
  }

  .aui-i-users {
    margin-left: 40px;
  }

  .aui-i-action-bar {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 20px;

    .aui-i-action-btn {
      margin-left: 10px;
      cursor: pointer;
    }

    .delete:hover {
      transform: scale(1.1);
      color: indianred;
    }

    .save:hover {
      transform: scale(1.1);
      color: #19be6b;
    }

    .close:hover {
      transform: scale(1.1);
      color: black;
    }
  }
}

</style>
