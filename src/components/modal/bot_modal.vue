<template>
  <Modal
      v-model="showModal"
      :title="title"
      width="500"
      @on-cancel="onCancel"
  >
    <Form ref="botForm" v-model="bot" :rules="ruleValidate">
      <FormItem class="aui-uploader-wrapper">
        <uploader
            ref="upload"
            v-model:src="bot.avatar"
        >
        </uploader>
      </FormItem>
      <FormItem label="名称" prop="name">
        <Input v-model="bot.name" show-word-limit maxlength="24" />
      </FormItem>
      <FormItem label="Token" prop="token">
        <Input v-model="bot.token" show-word-limit maxlength="128"
               type="textarea"
               :autosize="{minRows: 1,maxRows: 2}"
        />
      </FormItem>
      <FormItem label="简介" prop="remark">
        <Input v-model="bot.remark" show-word-limit maxlength="32"/>
      </FormItem>
    </Form>
    <template #footer>
      <Button type="error" @click="onDelete">删除</Button>
      <Button @click="onSubmit">确定</Button>
    </template>
  </Modal>
</template>

<script setup>
import BotService from '@/business/bot_service'
import defaultBotAvatar from '@/assets/images/default-bot-avatar.png';
import {computed, ref} from "vue"
import {Message, Modal} from 'view-ui-plus'
import Uploader from '@/components/uploader'

const showModal = ref(false)
const emit = defineEmits(['onSubmitted'])
const bot = ref({
  id: 0,
  name: '',
  token: '',
  avatar: defaultBotAvatar,
  remark: ''
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
  return bot.value.id === 0
})
let title = computed(() => {
  return isCreateMode.value ? '添加机器人' : '编辑机器人';
})

const onDelete = () => {
  Modal.confirm({
    title: '删除此机器人',
    content: `确认删除机器人：${bot.value.name}么`,
    loading: true,
    onOk: () => {
      BotService.deleteBot(
          bot.value.id
      ).then(() => {
        Message.success('删除成功');
        resetForm();
        emit('onSubmitted');
        Modal.remove()
        showModal.value = false
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
        BotService.addBot(
            bot.value.name,
            bot.value.token,
            bot.value.avatar,
            bot.value.remark
        ).then(() => {
          Message.success('添加成功');
          resetForm();
          emit('onSubmitted');
          showModal.value = false
        }).catch(err => {
          Message.error(err.errMsg);
        });
      } else {
        BotService.updateBot(
            bot.value.id,
            bot.value.name,
            bot.value.avatar,
            bot.value.remark
        ).then(() => {
          Message.success('更新成功');
          resetForm();
          emit('onSubmitted');
          showModal.value = false
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

const show = (curBot = null) => {
  if (curBot) {
    bot.value = curBot
  }
  showModal.value = true
}

defineExpose({
  show
})

</script>

<style lang="less">
.aui-uploader-wrapper {
  margin-bottom: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
