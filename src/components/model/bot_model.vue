<template>
  <Modal
      v-model="showModel"
      :title="title"
      width="500"
      @on-cancel="onCancel"
  >
    <Form ref="botForm" :model="form" :rules="ruleValidate">
      <FormItem class="aui-uploader-wrapper">
        <uploader
            ref="upload"
            v-model:src="form.avatar"
        >
        </uploader>
      </FormItem>
      <FormItem label="名称" prop="name">
        <Input v-model="form.name"
             show-word-limit maxlength="24"
        />
      </FormItem>
      <FormItem label="Token" prop="token">
        <Input v-model="form.token" show-word-limit maxlength="128"
             type="textarea"
             :autosize="{minRows: 1,maxRows: 2}"
        />
      </FormItem>
      <FormItem label="简介" prop="remark">
        <Input v-model="form.remark" show-word-limit maxlength="32" />
      </FormItem>
    </Form>
    <template #footer>
      <Button type="error" @click="onDelete">删除</Button>
      <Button @click="onSubmit">确定</Button>
    </template>
  </Modal>
</template>

<script setup>
import ProjectService from '@/service/project_service'
import defaultBotAvatar from '@/images/default-bot-avatar.png';
import {ref, computed, watch} from "vue"
import {Message, Modal} from 'view-ui-plus'
import Uploader from '@/components/uploader'

const props = defineProps(['show', 'mode', 'projectId', 'bot'])
const emit = defineEmits(['update:show', 'onSuccess', 'onDelete'])
const form = ref({
  avatar: defaultBotAvatar,
  name: '',
  token: '',
  remark: ''
})

watch(props, (newVal, oldVal) => {
  form.value.avatar = newVal.bot.avatar
  form.value.name = newVal.bot.name
  form.value.token = newVal.bot.token
  form.value.remark = newVal.bot.remark
})
const botForm = ref(null)
const ruleValidate = {
  name: [
    {required: true, message: '名称不能为空', trigger: 'blur'}
  ],
  token: [
    {required: true, message: '请填入机器人的token', trigger: 'blur'}
  ]
}

let isCreateMode = computed(() => {
  return props.mode === 'create'
})
let title = computed(() => {
  return isCreateMode.value ? '添加机器人' : '编辑机器人';
})
let showModel = computed({
  get() {
    return props.show;
  },
  set(newValue) {
    emit('update:show', newValue);
  }
})

const onDelete = () => {
  Modal.confirm({
    title: '删除此机器人',
    content: `确认删除机器人：${props.bot.name}么`,
    loading: true,
    onOk: () => {
      ProjectService.deleteBot(
          props.projectId,
          props.bot.id
      ).then(() => {
        Message.success('删除成功');
        resetForm();
        emit('onDelete');
        Modal.remove()
        showModel.value = false
      }).catch(err => {
        Message.error(err.errMsg);
      });
    }
  });
}

const onSubmit = () => {
  botForm.value.validate((valid) => {
    if (valid) {
      if (isCreateMode.value) {
        ProjectService.addBot(
            props.projectId,
            form.value.avatar,
            form.value.name,
            form.value.token,
            form.value.remark
        ).then(() => {
          Message.success('添加成功');
          resetForm();
          emit('onSuccess');
          showModel.value = false
        }).catch(err => {
          Message.error(err.errMsg);
        });
      } else {
        ProjectService.updateBot(
            props.projectId,
            props.bot.id,
            form.value.avatar,
            form.value.name,
            form.value.remark
        ).then(() => {
          Message.success('更新成功');
          resetForm();
          emit('onSuccess');
          showModel.value = false
        }).catch(err => {
          Message.error(err.errMsg);
        });
      }
    }
  })
}

const resetForm = () => {
  botForm.value.resetFields();
}

const onCancel = () => {
  resetForm()
}

</script>

<style lang="less">
  .aui-uploader-wrapper{
    margin-bottom: 15px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
