<template>
  <Modal
      v-model="laneModal.show"
      :title="title"
      :width="350"
      @on-cancel="cancel"
  >
    <Form ref="laneForm" :model="form" :rules="ruleValidate" :label-width="80">
      <FormItem label="泳道名称" prop="name">
        <Input v-model="form.name"/>
      </FormItem>
      <FormItem label="WIP" prop="wip" v-if="!isCreateMode">
        <InputNumber :max="15" :min="0" v-model="form.wip" :editable="false"></InputNumber>
      </FormItem>
      <FormItem label="终结泳道" prop="isEnd" v-if="!isCreateMode">
        <Switch v-model="form.isEnd"/>
      </FormItem>
    </Form>
    <template #footer>
      <Button @click="confirm">确定</Button>
    </template>
  </Modal>
</template>

<script setup>
import {computed, inject, ref} from "vue";
import {FormItem, InputNumber, Message, Modal, Switch} from 'view-ui-plus'
import {useModalStore} from "@/store";
import {storeToRefs} from "pinia";

const modalStore = useModalStore()
const {projectId, laneModal} = storeToRefs(modalStore)

const ruleValidate = {
  name: [
    {required: true, message: '泳道名称不能为空', trigger: 'blur'}
  ]
}
const laneForm = ref(null)
const form = ref({
  id: 0,
  name: '',
  wip: 8,  // 默认
  isEnd: false
})
const project = inject('project')

modalStore.$subscribe((_, state) => {
  const store = state.laneModal
  if (store.show) {
    form.value.id = store.lane?.id || 0
    form.value.name = store.mode === 'create' ? '' : store.lane?.name || ''
    form.value.wip = store.lane ? store.lane.wip : 8
    form.value.isEnd = store.lane?.isEnd || false
  }
})

const isCreateMode = computed(() => {
  return laneModal.value.mode === 'create'
})

const title = computed(() => {
  return isCreateMode.value ? '添加泳道' : '修改泳道'
})

const confirm = () => {
  laneForm.value.validate((valid) => {
    if (valid) {
      if (isCreateMode.value) {
        project.value.addLane(form.value.name, laneModal.value.kanbanType, laneModal.value.lane ? laneModal.value.lane.id : 0).then(() => {
          modalStore.close('laneModal')
          Message.success('泳道已添加');
          resetForm();
        })
      } else {
        project.value.updateLane(form.value).then(() => {
          modalStore.close('laneModal')
          Message.success('更新成功');
          resetForm();
        })
      }
    }
  })
}

const resetForm = () => {
  laneForm.value.resetFields()
}

const cancel = () => {
  resetForm()
}

</script>

<style scoped lang="less">

</style>
