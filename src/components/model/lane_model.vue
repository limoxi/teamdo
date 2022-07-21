<template>
  <Modal
      v-model="showModel"
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
      <FormItem label="终结泳道" prop="isEnd">
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
import {events, EventBus} from '@/service/event_bus'
import {ref, computed, inject, watch} from "vue";
import {Message} from "view-ui-plus";

const ruleValidate = {
  name: [
    {required: true, message: '泳道名称不能为空', trigger: 'blur'}
  ]
}
const laneForm = ref(null)
let defaultForm = {
  id: 0,
  name: '',
  wip: 8,  // 默认
  isEnd: false
}
const form = ref(defaultForm)
const project = inject('project')
const props = defineProps(['show', 'mode', 'lane'])

watch(props, (newV, oldV) => {
  if (newV.mode === 'create'){
    resetForm()
    form.value = defaultForm
  } else {
    form.value.id = newV.lane.id
    form.value.name = newV.lane.name
    form.value.wip = newV.lane.wip
    form.value.isEnd = newV.lane.is_end
  }
})
const emit = defineEmits(['update:show'])

const isCreateMode = computed(() => {
  return props.mode === 'create'
})

const title = computed(() => {
  return isCreateMode.value ? '添加泳道' : '修改泳道'
})

let showModel = computed({
  get() {
    return props.show;
  },
  set(newValue) {
    emit('update:show', newValue);
  }
})

const confirm = () => {
  laneForm.value.validate((valid) => {
    if (valid) {
      if (isCreateMode.value) {
        LaneService.addLane(project.id, form.value.name, props.lane ? props.lane.id : 0).then(() => {
          EventBus.emit(events.LANE_UPDATED);
          Message.success('泳道已添加');
          showModel.value = false;
          resetForm();
        }).catch(err => {
          Message.error(err.errMsg);
        })
      } else {
        LaneService.updateLane(project.id, form.value).then(() => {
          EventBus.emit(events.LANE_UPDATED);
          Message.success('更新成功');
          showModel.value = false;
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
