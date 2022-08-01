<template>
  <Modal
      v-model="projectModal.show"
      :title="title"
      @on-ok="submit"
  >
    <Form ref="projectForm" :model="form" :rules="ruleValidate" :label-width="80">
      <FormItem label="项目名" prop="name">
        <Input v-model="form.name" />
      </FormItem>
      <FormItem v-if="!isCreateMode" label="项目前缀" prop="prefix">
        <Input v-model="form.prefix" readonly disabled />
      </FormItem>
      <FormItem label="简介" prop="desc">
        <Input v-model="form.desc" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="项目简要描述" />
      </FormItem>
    </Form>
  </Modal>
</template>

<script setup>
import ProjectService from '@/service/project_service';
import {useModalStore} from "@/store"
import {storeToRefs} from "pinia";
import {ref, computed, onMounted} from "vue";
import {Message} from "view-ui-plus";

const ruleValidate = {
  name: [
    {required: true, message: '项目名不能为空', trigger: 'blur'}
  ],
  desc: [
    {required: true, message: '简要描述一下这个项目吧', trigger: 'blur'}
  ]
}
const modalStore = useModalStore()
const {projectId, projectModal} = storeToRefs(modalStore)
const projectForm = ref(null)
let form = ref({
  id: 0,
  name: '',
  prefix: '',
  desc: ''
})
const emit = defineEmits(['onSubmitted'])

onMounted(() => {
  modalStore.$subscribe((_, state) => {
    const store = state.projectModal
    if (store.show) {
      form.value.id = store.project?.id || 0
      form.value.name = store.project?.name || ''
      form.value.prefix = store.project?.prefix || ''
      form.value.desc = store.project?.desc || ''
    }
  })
})

const isCreateMode = computed(() => projectId.value === 0)
const title = computed(() => isCreateMode.value ? '创建项目' : '更新项目')

const submit = () => {
  projectForm.value.validate((valid) => {
    if (valid) {
      if (isCreateMode.value) {
        ProjectService.createProject(
            form.value.name,
            form.value.desc
        ).then(() => {
          emit('onSubmitted')
          Message.success('成功创建新项目')
        }).catch(err => {
          Message.error(err.errMsg);
        });
      } else {
        ProjectService.updateProject(
            form.value.id,
            form.value.name,
            form.value.desc
        ).then(() => {
          emit('onSubmitted')
          Message.success('更新成功');
        })
      }
    }
  })
}

</script>

<style scoped lang="less">

</style>
