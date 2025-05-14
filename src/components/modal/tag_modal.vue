<template>
  <Modal
      v-model="showModel"
      :title="isCreateMode ? '新增标签' : '编辑标签'"
  >
    <Form ref="tagForm" :model="form" :rules="ruleValidate" :label-width="80">
      <FormItem label="类型" prop="bizCode">
        <Select v-model="form.bizCode" :disabled="!isCreateMode">
          <Option value="normal_task">看板标签</Option>
          <Option value="epic_task">需求标签</Option>
        </Select>
      </FormItem>
      <FormItem label="名称" prop="name">
        <Input v-model="form.name"
               show-word-limit maxlength="18"
        />
      </FormItem>
      <FormItem label="颜色" prop="color">
        <RadioGroup v-model="form.color" type="button">
          <Radio v-for="color in colors" border :label="color">
            <Icon type="md-square" :style="`color: ${color}; font-size: 24px; vertical-align: middle`"/>
          </Radio>
        </RadioGroup>
      </FormItem>
    </Form>
    <template #footer>
      <Button @click="onSubmit">确定</Button>
    </template>
  </Modal>
</template>

<script setup>
import {FormItem, Icon, Input, Message, Modal, Option, Radio, RadioGroup} from "view-ui-plus";
import TagService from '@/business/tag_service';
import {colors} from '@/utils/constant'
import {computed, ref} from "vue";

const emit = defineEmits(['update'])
const props = defineProps(['projectId'])

const defaultColor = '#2b85e4'
const defaultBiz = 'normal_task'

const form = ref({
  bizCode: defaultBiz,
  name: '',
  color: defaultColor
})

const tagForm = ref(null)
const showModel = ref(false)
const tag = ref(null)

const isCreateMode = computed(() => {
  return !(tag.value?.id)
})

const ruleValidate = {
  name: [
    {required: true, message: '名称不能为空', trigger: 'blur'}
  ]
}

const show = (t = null) => {
  tag.value = t
  form.value.bizCode = t?.biz_code || defaultBiz
  form.value.name = t?.name || ''
  form.value.color = t?.color || defaultColor
  showModel.value = true
}

const onSubmit = () => {
  tagForm.value.validate((valid) => {
    if (valid) {
      if (isCreateMode.value) {
        TagService.addTag(
            props.projectId,
            form.value.bizCode,
            form.value.name,
            form.value.color
        ).then(() => {
          emit('update')
          Message.success('添加成功');
          resetForm();
        }).catch(err => {
          Message.error(err.errMsg);
        });
      } else {
        TagService.updateTag(
            props.projectId,
            tag.value.id,
            form.value.name,
            form.value.color
        ).then(() => {
          emit('update')
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
  showModel.value = false
  form.value.bizCode = defaultBiz
  form.value.name = ''
  form.value.color = defaultColor
  tagForm.value.resetFields()
}

defineExpose({
  show
})

</script>

<style scoped lang="less">

</style>