<template>
  <Modal
    v-model="showModal"
    :title="title"
    width="80"
    style="top:25px"
    @on-cancel="onCancel"
  >
    <Form ref="releaseForm" :model="release" :rules="ruleValidate">
      <FormItem label="版本" prop="version">
        <Input style="width:15vw" v-model="release.version" show-word-limit maxlength="16"/>
      </FormItem>
      <FormItem label="描述" prop="title">
        <Space>
          <Select v-model="release.label" style="display:inline-block;width:8vw">
            <Option v-for="option in labelOptions" :key="option.value" :value="option.value">
              {{option.label}}
            </Option>
          </Select>
          <Input style="width: 60vw" v-model="release.title" show-word-limit maxlength="24"/>
        </Space>
      </FormItem>
      <FormItem label="详情" prop="detail">
        <TipTapEditor ref="editorInst" :content="release.detail"></TipTapEditor>
      </FormItem>
    </Form>
    <template #footer>
      <Button @click="onSubmit">确定</Button>
    </template>
  </Modal>
</template>

<script setup>
import {computed, ref} from 'vue'
import {Form, FormItem, Message, Modal, Space} from 'view-ui-plus'
import ReleaseService from '@/business/release_service'
import TipTapEditor from '@/components/editor_tiptap/editor'

const labelOptions = [{
  'label': '里程碑',
  'value': 'milestone'
}, {
  'label': '新功能',
  'value': 'feat'
}, {
  'label': '问题修复',
  'value': 'bugfix'
}]

const editorInst = ref(null)
const showModal = ref(false)
const emit = defineEmits(['onSubmitted'])
const release = ref({
  id: 0,
  version: '',
  label: 'feat',
  title: '',
  detail: ''
})

const releaseForm = ref(null)
const ruleValidate = {
  version: [
    {required: true, message: '版本不能为空', trigger: 'blur'}
  ],
  title: [
    {required: true, message: '标题不能为空', trigger: 'blur'}
  ]
}

let isCreateMode = computed(() => {
  return release.value.id === 0
})
let title = computed(() => {
  return isCreateMode.value ? '发布更新' : '编辑'
})

const onSubmit = () => {
  releaseForm.value.validate((valid) => {
    if (valid) {
      let outlines = []
      const detail = editorInst.value.getContent()
      if (isCreateMode.value) {
        ReleaseService.newRelease(
          release.value.version,
          release.value.label,
          release.value.title,
          detail,
          outlines
        ).then(() => {
          Message.success('添加成功')
          resetForm()
          emit('onSubmitted')
          showModal.value = false
        }).catch(err => {
          Message.error(err.errMsg)
        })
      } else {
        ReleaseService.updateRelease(
          release.value.id,
          release.value.version,
          release.value.label,
          release.value.title,
          detail,
          outlines
        ).then(() => {
          Message.success('更新成功')
          resetForm()
          emit('onSubmitted')
          showModal.value = false
        }).catch(err => {
          Message.error(err.errMsg)
        })
      }
    }
  })
}

const resetForm = () => {
  releaseForm.value.resetFields()
}

const onCancel = () => {
  resetForm()
}

const show = (curRelease = null) => {
  if (curRelease) {
    release.value = curRelease
  }
  showModal.value = true
}

defineExpose({
  show
})

</script>

<style lang="less" scoped>

</style>
