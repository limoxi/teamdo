<template>
  <Modal
      v-model="epicModal.show"
      style="top:8%"
      class="aui-task-model"
      width="80%"
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
      <div style="display: flex; flex-direction: row; justify-content: flex-start">
        <FormItem label="优先级" prop="importance">
          <Select v-model="form.importance" style="width:180px" aria-label="importanceSelector">
            <Option v-for="option in importanceOptions" :value="option.value" :key="option.value">
              {{ option.label }}
            </Option>
          </Select>
        </FormItem>
        <FormItem label="需求来源" prop="fromWhere">
          <Tag type="dot" closable v-if="form.fromWhere"
               @on-close="handleCloseTag"
          >
            {{ form.fromWhere }}
          </Tag>
          <Select
              v-if="!form.fromWhere"
              filterable
              allow-create
              clearable
              @on-select="handleSelectTag"
              @on-create="handleCreateTag"
              class="aui-i-tagFilter"
          >
            <Option v-for="tag in selectableTags" :value="tag.id" :key="tag.id">
              <Badge :color="tag.color" :text="tag.name"/>
            </Option>
          </Select>
        </FormItem>
      </div>
      <FormItem label="截止时间" prop="expectedFinishedAt">
        <DatePicker
            type="date"
            v-model="form.expectedFinishedAt"
            format="yyyy-MM-dd"
            style="width: 180px"/>
      </FormItem>
      <FormItem label="需求概述" prop="name">
        <Input
            type="textarea"
            :autosize="{minRows: 1,maxRows: 3}"
            show-word-limit
            :maxlength="48"
            v-model="form.name"
            style="width: 48%"/>
      </FormItem>
      <FormItem label="文档链接" prop="docLink">
        <Input
            :maxlength="24"
            v-model="form.docLink"
            style="width: 70%"/>
        <Button v-if="form.docLink !== ''" type="text" @click="onOpenLink(form.docLink)">打开</Button>
      </FormItem>
      <FormItem label="设计链接" prop="designLink">
        <Input
            :maxlength="24"
            v-model="form.designLink"
            style="width: 70%"/>
        <Button v-if="form.designLink !== ''" type="text" @click="onOpenLink(form.designLink)">打开</Button>
      </FormItem>
      <FormItem label="详细描述" prop="desc">
        <Editor ref="editorInst" :content="form.desc"/>
      </FormItem>
    </Form>
  </Modal>
</template>
<script setup>
import Editor from '@/components/editor/editor'
import {computed, inject, ref} from "vue";
import {FormItem, Message, Modal} from "view-ui-plus";
import {importanceOptions} from '@/utils/constant'
import {useModalStore} from "@/store"
import {storeToRefs} from "pinia";
import EpicTaskService from "../../service/epic_task_service";

const projectId = inject('projectId')
const project = inject('project')
const selectedTag = ref(null)
const selectableTags = computed(() => [...project.value.tags])

const modalStore = useModalStore()
const {epicModal} = storeToRefs(modalStore)
const task = computed(() => epicModal.value.task)
const isCreateMode = computed(() => !task.value)

const ruleValidate = {
  name: [
    {required: true, message: '需求概述不能为空', trigger: 'blur'}
  ],
  importance: [
    {required: true, message: '请选择优先级', trigger: 'blur'}
  ]
}

const title = computed(() => {
  return task.value ? '需求详情' : '添加需求'
})

let form = ref({
  fromWhere: '',
  name: '',
  importance: '0',
  expectedFinishedAt: '',
  docLink: '',
  designLink: '',
  desc: ''
})
const taskForm = ref(null)
const editorInst = ref()

modalStore.$subscribe((_, state) => {
  const store = state.epicModal
  if (store.show && store.task) {
    form.value.fromWhere = store.task?.fromWhere ?? ''
    form.value.name = store.task?.name ?? ''
    form.value.importance = store.task?.importance + ''
    form.value.expectedFinishedAt = store.task?.expectedFinishedAt ?? ''
    form.value.docLink = store.task?.docLink ?? ''
    form.value.designLink = store.task?.designLink ?? ''
    form.value.desc = store.task?.desc ?? ''
    if ((store.task?.tags || []).length > 0) {
      selectedTag.value = store.task.tags[0]
    }

    editorInst.value.resetContent(store.task?.desc ?? '')
  }
})

const close = () => {
  modalStore.close('epicModal')
}

const actionDone = () => {
  Message.success('操作成功');
  close()
}

const handleCreateTag = (newTagName) => {
  const newTag = {
    id: -(selectableTags.value.length),
    name: newTagName,
    color: '#17233d'
  }
  selectableTags.value.push(newTag)
  form.value.fromWhere = newTag.name
  selectedTag.value = newTag
}

const handleSelectTag = (st) => {
  const tagId = st.value
  if (tagId < 0) return
  const tag = selectableTags.value.filter(tag => tag.id === tagId)[0]
  console.log(tag)
  form.value.fromWhere = tag.name
  selectedTag.value = tag
}

const handleCloseTag = () => {
  form.value.fromWhere = ''
  selectedTag.value = null
}

const handleSubmit = () => {
  taskForm.value.validate((valid) => {
    if (valid) {
      const taskData = {
        name: form.value.name.replace(/\s+/g, ""),
        desc: editorInst.value.getContent(),
        importance: form.value.importance * 1,
        expectedFinishedAt: form.value.expectedFinishedAt,
        metaData: {
          'doc_link': form.value.docLink,
          'design_link': form.value.designLink
        },
        tagIds: [selectedTag.value.id]
      }
      if (isCreateMode.value) {
        EpicTaskService.addEpicTask(projectId, taskData).then(() => {
          actionDone()
        })
      } else {
        taskData.id = task.value.id
        EpicTaskService.updateEpicTask(projectId, taskData).then(() => {
          actionDone()
        })
      }
    }
  })
}

const handleDelete = () => {
  Modal.confirm({
    title: '删除需求',
    content: `'<strong>确定要删除需求【${task.value.name}】么？</strong>'`,
    okText: '确认',
    cancelText: '再想想',
    onOk: () => {
      EpicTaskService.deleteEpicTask(
          projectId, task.value.id).then(() => {
        actionDone()
      })
    }
  });
}

const onOpenLink = link => {
  window.open(link);
}

</script>

<style lang="less">
.aui-task-model {
  .ivu-modal-header {
    position: sticky;
    top: 0;
    background: white;
    z-index: 1;
    border-radius: 10px 10px 0 0;
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
