<template>
  <Modal
      v-model="taskModal.show"
      :closable="false"
      :lock-scroll="true"
      :mask-closable="false"
      class="aui-task-model"
      footer-hide
      style="top:8%"
      width="65%"
  >
    <template #header>
      <div class="aui-i-title">{{ title }}</div>
      <div class="aui-i-action-bar">
        <Icon v-if="!isCreateMode" class="aui-i-action-btn delete" type="md-trash" @click="handleDelete"/>
        <Icon class="aui-i-action-btn save" type="md-done-all" @click="handleSubmit"/>
        <Icon class="aui-i-action-btn close" type="md-close" @click="close"/>
      </div>
    </template>
    <Form ref="taskForm"
          :label-width="80"
          :model="form"
          :rules="ruleValidate"
          @submit.prevent
    >
      <FormItem v-if="isRelationMode" label="项目" prop="projectId" style="float: left; margin-right: 15px;">
        <ProjectSelector
            style="width:220px"
            :projectId="form.projectId"
            @on-select="v => form.projectId=v"
        ></ProjectSelector>
      </FormItem>
      <FormItem label="任务类型" prop="type" style="display: inline-block">
        <Select v-model="form.type" aria-label="typeSelector" style="width:150px">
          <Option v-for="option in taskTypeOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </Option>
        </Select>
      </FormItem>
      <FormItem label="优先级" prop="importance" style="display: inline-block">
        <Select v-model="form.importance" aria-label="importanceSelector" style="width:150px">
          <Option v-for="option in importanceOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </Option>
        </Select>
      </FormItem>
      <FormItem v-if="form.type==='BUG' && form.relatedTaskId > 0" label="关联任务" prop="relatedTaskId">
        <Input :value="form.relatedTaskId" disabled style="width: 180px">
          <template #prefix>
            <Icon type="ios-link"/>
          </template>
        </Input>
      </FormItem>
      <FormItem :label="nameLabel" prop="name">
        <Input
            v-model="form.name"
            :autosize="{minRows: 1,maxRows: 3}"
            :maxlength="48"
            :placeholder="form.type==='REQ'?'某人可以在何时何处做某事': ''"
            show-word-limit
            style="width: 90%" type="textarea"></Input>
      </FormItem>
      <FormItem label="故事点" prop="sp">
        <InputNumber
            v-model="form.sp"
            :max="28"
            :min="0"
            :precision="0"
            :step="1"
        ></InputNumber>
        <span class="aui-i-spRemark">
              <Icon type="md-alert"/>
              故事点是一个相对数值，1个故事点可视为最多半天工作量
            </span>
      </FormItem>
      <FormItem label="执行者" prop="assignors">
        <UserSelector :projectId="project.id" @on-selected="onSelectUser"></UserSelector>
        <span v-if="form.assignors.length > 0" class="aui-i-assignors">
          <span class="aui-i-assignor" v-for="au in form.assignors" :key="au.id">
            <span class="aui-i-assignor-del">
              <Icon v-if="!task?.isFinished()" class="aui-i-btn" type="md-trash"
                    @click="onDeleteUser(au.id)"/>
            </span>
            <Avatar class="aui-avatar-alter" :src="au.avatar">{{ au.nickname[0] }}</Avatar>
          </span>
        </span>
        <span v-if="userCount > 0" class="aui-i-users">
              <span>参与者({{ userCount }})&nbsp;&nbsp;</span>
              <Tooltip v-for="user in task.users" :key="user.id" :content="user.nickname">
                <Avatar class="aui-avatar-alter" :src="user.avatar" size="small">
                  {{ user.nickname[0] }}
                </Avatar>
              </Tooltip>
            </span>
      </FormItem>
      <FormItem label="标签" prop="tags">
        <Tag v-for="tag in form.tags" :key="tag.id"
             :color="tag.color" closable type="dot"
             @on-close="handleCloseTag(tag)"
        >
          {{ tag.name }}
        </Tag>
        <TagSelector
            class="aui-i-tagFilter"
            :tags="project.getTagsByBiz('normal_task')"
            @on-selected="handleSelectTag"/>
      </FormItem>
      <FormItem label="详细描述" prop="desc" v-if="taskModal.show">
        <TipTapEditor ref="editorInst" :content="form.desc"></TipTapEditor>
      </FormItem>
    </Form>
  </Modal>
</template>
<script setup>
import TipTapEditor from '@/components/editor_tiptap/editor'
import UserSelector from '@/components/user_selector'
import TagSelector from '@/components/tag_selector'
import ProjectSelector from '@/components/project_selector'
import {computed, inject, ref} from 'vue'
import {Avatar, FormItem, Icon, Input, InputNumber, Message, Modal, Option, Select, Tag, Tooltip} from 'view-ui-plus'
import {importanceOptions, taskTypeOptions} from '@/utils/constant'
import helper from '@/utils/helper'
import {useModalStore} from '@/store'
import {storeToRefs} from 'pinia'
import TaskService from "@/business/task_service";

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
  ],
}

const userCount = computed(() => {
  return (task.value?.users || []).length
})

const isRelationMode = computed(() => {
  return !!taskModal.value.relatedTask
})

const title = computed(() => {
  let t = ''
  if (isRelationMode.value) {
    t = '添加关联任务'
  } else {
    t = task.value ? '任务详情' : '添加任务'
  }

  if (isRelationMode.value) {
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

const form = ref({
  projectId: projectId.value + '',
  type: 'REQ',
  name: '',
  importance: '0',
  sp: 0,
  assignors: [],
  tags: [],
  desc: ''
})
const taskForm = ref(null)
const editorInst = ref(null)

const emit = defineEmits(['onAdd', 'onUpdate', 'onDelete'])

modalStore.$onAction(({name, store, args, after}) => {
  store = store.taskModal
  if (name === 'show' && args.length > 0 && args[0] === 'taskModal') {
    after(() => {
      form.value.type = store.task?.type || 'REQ'
      form.value.name = store.task?.name || ''
      form.value.importance = (store.task?.importance || store.relatedTask?.importance || 0) + ''
      form.value.projectId = store.relatedTask?.projectId || projectId.value
      form.value.sp = store.task?.sp || 0
      form.value.assignors = store.task?.users.filter(u => u.is_assignor) || []
      form.value.tags = store.task?.tags || []
      form.value.desc = store.task?.desc || ''
    })
  }
})

const handleSelectTag = (tagId) => {
  if (form.value.tags.filter(tag => tag.id === tagId).length > 0) return
  const tag = project.value.tags.filter(tag => tag.id === tagId && tag.biz_code === 'normal_task')[0]
  form.value.tags.push(tag)
}

const close = () => {
  submitting = false
  modalStore.close('taskModal')
}

const handleCloseTag = (tag) => {
  helper.removeFromArray(tag, form.value.tags, 'id')
}

const actionDone = () => {
  Message.success('操作成功')
  close()
}

const onSelectUser = selectedUser => {
  if (form.value.assignors.length >= 3) {
    Message.error('已达人数上限')
    return
  }

  if (form.value.assignors.filter(user => user.id === selectedUser.id).length > 0) {
    Message.warning('请勿重复选择')
    return
  }

  form.value.assignors.push(selectedUser)
}

const onDeleteUser = uid => {
  const index = form.value.assignors.findIndex(u => u.id === uid)
  form.value.assignors.splice(index, 1)
}

const handleSubmit = () => {
  // if (submitting) return
  submitting = true
  taskForm.value.validate((valid) => {
    if (valid) {
      const taskData = {
        type: form.value.type,
        name: form.value.name.replace(/\s+/g, ''),
        desc: editorInst.value.getContent(),
        importance: form.value.importance * 1,
        sp: form.value.sp,
        assignorIds: form.value.assignors.map(u => u.id),
        relatedTaskId: taskModal.value.relatedTask?.id || 0,
        tagIds: form.value.tags.map(tag => {
          return tag.id
        }),
        metaData: {
          attentions: editorInst.value.getAttentions()
        }
      }
      if (isRelationMode.value) {
        TaskService.addTask(form.value.projectId, taskData).then((newTask) => {
          actionDone()
        }).catch(err => {
          Message.error(err.errMsg)
        }).finally(() => {
          submitting = false
        })
      } else if (isCreateMode.value) {
        project.value.addTask(taskData).then((newTask) => {
          emit('onAdd', newTask)
          actionDone()
        }).catch(err => {
          Message.error(err.errMsg)
        }).finally(() => {
          submitting = false
        })
      } else {
        taskData.id = task.value.id
        project.value.updateTask(taskData).then((updatedTask) => {
          emit('onUpdate', updatedTask)
          actionDone()
        }).catch(err => {
          Message.error(err.errMsg)
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
      }).catch(err => {
        Message.error(err.errMsg || '操作失败')
      })
    }
  })
}

</script>

<style lang="less" scoped>
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

  .aui-i-assignors {
    margin-left: 10px;

    .aui-i-assignor {
      position: relative;
      margin-right: 5px;

      .aui-i-assignor-del {
        display: none;
        position: absolute;
        top: -7px;
        text-align: center;
        color: indianred;
        font-size: 18px;
        width: 32px;
        height: 32px;
        border-radius: 100px;
        background: rgba(0, 0, 0, 0.4);
      }

      &:hover {
        .aui-i-assignor-del {
          display: inline-block;
          z-index: 1;
        }
      }
    }
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
