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
                <Icon v-if="!isReadOnly && !isCreateMode" class="aui-i-action-btn delete" type="md-trash"
                      @click="handleDelete"/>
                <Icon v-if="!isReadOnly" type="md-done-all" class="aui-i-action-btn save" @click="handleSubmit"/>
                <Icon type="md-close" class="aui-i-action-btn close" @click="close"/>
            </div>
        </template>
        <Form ref="taskForm"
              @submit.prevent
              :model="form"
              :rules="ruleValidate"
              :label-width="80"
        >
            <FormItem v-if="!isReadOnly && !isCreateMode" label="变更说明" prop="remark">
                <Input
                        v-model="form.remark"
                        style="width: 70%"/>
            </FormItem>
            <div style="display: flex; flex-direction: row; justify-content: flex-start">
                <FormItem label="优先级" prop="importance">
                    <Select v-model="form.importance" style="width:180px" aria-label="importanceSelector">
                        <Option v-for="option in importanceOptions" :value="option.value" :key="option.value">
                            {{ option.label }}
                        </Option>
                    </Select>
                </FormItem>
                <FormItem label="需求来源" prop="fromWhere" style="margin-left: 10px">
                    <Tag type="dot" closable v-if="form.fromWhere"
                         :color="selectedTag.color" @on-close="handleCloseTag"
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
                        type="datetime"
                        v-model="form.expectedFinishedAt"
                        format="yyyy-MM-dd HH:mm"
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
                        v-model="form.docLink"
                        style="width: 70%"/>
                <Button v-if="form.docLink !== ''" type="text" @click="onOpenLink(form.docLink)">打开</Button>
            </FormItem>
            <FormItem label="设计链接" prop="designLink">
                <Input
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
import Editor from '@/components/editor/editor';
import {computed, inject, ref} from "vue";
import {Badge, DatePicker, FormItem, Icon, Message, Modal, Tag} from 'view-ui-plus'
import {importanceOptions} from '@/utils/constant';
import {useModalStore} from "@/store";
import {storeToRefs} from "pinia";
import EpicTaskService from "@/business/epic_task_service";
import TagService from "@/business/tag_service";
import moment from "moment/moment";

const projectId = inject('projectId')
const project = inject('project')
const selectedTag = ref(null)
const selectableTags = computed(() => [...project.value.getTagsByBiz('epic_task')])

const emit = defineEmits(['onAdd', 'onUpdate', 'onDelete'])

const modalStore = useModalStore()
const {epicModal} = storeToRefs(modalStore)
const task = computed(() => epicModal.value.task)
const isCreateMode = computed(() => !epicModal.value.readonly && !task.value)
const isReadOnly = computed(() => epicModal.value.readonly)
let submitting = false

const ruleValidate = {
    name: [
        {required: true, message: '需求概述不能为空', trigger: 'blur'}
    ],
    importance: [
        {required: true, message: '请选择优先级', trigger: 'blur'}
    ],
    remark: [
        {required: true, message: '需求变更记录不能为空', trigger: 'blur'}
    ]
}

const title = computed(() => {
    return task.value ? `需求详情 #${task.value.id}` : '添加需求'
})

let form = ref({
    fromWhere: '',
    name: '',
    importance: '0',
    expectedFinishedAt: '',
    docLink: '',
    designLink: '',
    desc: '',
    remark: ''
})
const taskForm = ref(null)
const editorInst = ref()

modalStore.$subscribe((_, state) => {
    const store = state.epicModal
    if (store.show) {
        if (!['', '未知'].includes(store.task?.fromWhere || '')) {
            form.value.fromWhere = store.task.fromWhere
        }
        form.value.name = store.task?.name ?? ''
        form.value.importance = store.task?.importance + ''
        form.value.expectedFinishedAt = store.task?.expectedFinishedAt ?? ''
        form.value.docLink = store.task?.docLink ?? ''
        form.value.designLink = store.task?.designLink ?? ''
        form.value.desc = store.task?.desc ?? ''
        if ((store.task?.tags ?? []).length > 0) {
            selectedTag.value = store.task.tags[0]
        }
        form.value.remark = ''

        editorInst.value.resetContent(store.task?.desc ?? '')
        submitting = false
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
    if (isReadOnly.value) return

    const color = '#17233d'
    const bizCode = 'epic_task'
    TagService.addTag(projectId, bizCode, newTagName, color).then(data => {
        const newTag = {
            id: data.id,
            biz_code: bizCode,
            name: newTagName,
            color: color
        }
        selectableTags.value.push(newTag)
        form.value.fromWhere = newTagName
        selectedTag.value = newTag
    })
}

const handleSelectTag = (st) => {
    const tagId = st.value
    if (tagId < 0) return
    const tag = selectableTags.value.filter(tag => tag.id === tagId)[0]
    form.value.fromWhere = tag.name
    selectedTag.value = tag
}

const handleCloseTag = () => {
    form.value.fromWhere = ''
    selectedTag.value = null
}

const handleSubmit = () => {
    if (isReadOnly.value) return
    // if (submitting) return
    submitting = true
    taskForm.value.validate(async (valid) => {
        if (valid) {
            if (!selectedTag.value) {
                Message.warning('请填写需求来源！')
                return
            }
            const taskData = {
                name: form.value.name.replace(/\s+/g, ""),
                desc: editorInst.value.getContent(),
                importance: form.value.importance * 1,
                tagIds: [selectedTag.value.id],
                metaData: {
                    'doc_link': form.value.docLink,
                    'design_link': form.value.designLink
                }
            }
            if (form.value.expectedFinishedAt) {
                taskData.expectedFinishedAt = moment(form.value.expectedFinishedAt).format('YYYY-MM-DD HH:mm:ss')
            }

            if (isCreateMode.value) {
                taskData.beforeTaskId = epicModal.value.beforeTaskId
                project.value.addEpicTask(taskData).then(newTask => {
                    emit('onAdd', newTask)
                    actionDone()
                }).catch(err => {
                    Message.error(err.errMsg || '操作失败')
                }).finally(() => {
                    submitting = false
                })
            } else {
                taskData.id = task.value.id
                taskData.remark = form.value.remark
                project.value.updateEpicTask(taskData).then(updatedTask => {
                    emit('onUpdate', updatedTask)
                    actionDone()
                }).catch(err => {
                    Message.error(err.errMsg || '操作失败')
                }).finally(() => {
                    submitting = false
                })
            }
        }
    })
}

const handleDelete = () => {
    if (isReadOnly.value) return
    Modal.confirm({
        title: '删除需求',
        content: `'<strong>确定要删除需求【${task.value.name}】么？</strong>'`,
        okText: '确认',
        cancelText: '再想想',
        onOk: () => {
            EpicTaskService.deleteEpicTask(
                projectId, task.value.id).then(() => {
                emit('onDelete')
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
