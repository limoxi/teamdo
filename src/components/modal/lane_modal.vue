<template>
  <Modal
      v-model="laneModal.show"
      :title="title"
      :width="350"
      @on-cancel="cancel"
  >
    <Form ref="laneForm" :model="form" :rules="ruleValidate" :label-width="80">
      <FormItem label="泳道名称" prop="name">
        <Input v-model="form.name" />
      </FormItem>
      <FormItem label="WIP" prop="wip" v-if="!isCreateMode">
        <InputNumber :max="15" :min="0" v-model="form.wip" :editable="false"></InputNumber>
      </FormItem>
      <FormItem label="终结泳道" prop="isEnd" v-if="!isCreateMode">
        <Switch v-model="form.isEnd" />
      </FormItem>
    </Form>
    <template #footer>
      <Button @click="confirm">确定</Button>
    </template>
  </Modal>
</template>

<script setup>
import LaneService from '@/service/lane_service';
import {ref, computed, inject} from "vue";
import {Message} from "view-ui-plus";
import {useModalStore} from "@/store";
import {storeToRefs} from "pinia";

const modalStore = useModalStore()
const {projectId, laneModal} = storeToRefs(modalStore)
const emit = defineEmits(['onSubmitted'])

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
const project = inject('project').value

modalStore.$subscribe((_, state) => {
  const store = state.laneModal
  form.value.id = store.lane?.id || 0
  form.value.name = store.mode === 'create' ? '' : store.lane?.name || ''
  form.value.wip = store.lane?.wip || 8
  form.value.isEnd = store.lane?.is_end || false
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
        LaneService.addLane(project.id, form.value.name, laneModal.value.lane ? laneModal.value.lane.id : 0).then(() => {
          emit('onSubmitted')
          modalStore.close('laneModal')
          Message.success('泳道已添加');
          resetForm();
        }).catch(err => {
          Message.error(err.errMsg);
        })
      } else {
        LaneService.updateLane(project.id, form.value).then(() => {
          emit('onSubmitted')
          modalStore.close('laneModal')
          Message.success('更新成功');
          resetForm();
        }).catch(err => {
          Message.error(err.errMsg);
        });
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
