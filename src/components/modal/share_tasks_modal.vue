<template>
  <Modal
      v-model="showModel"
      title="发布分享内容"
      :width="800"
      @on-cancel="cancel"
      @on-visible-change="onVisibleChange"
  >
    <Form ref="form"
          @submit.prevent
          :model="shareData"
          :rules="ruleValidate"
          :label-width="80"
    >
      <FormItem label="分享标题" prop="title">
        <Input
            type="textarea"
            :autosize="{minRows: 2,maxRows: 3}"
            show-word-limit
            :maxlength="48"
            v-model="shareData.title"
            style="width: 90%"/>
      </FormItem>

      <FormItem label="类型" prop="type">
        <Select v-model="shareData.type" style="width:180px" aria-label="botSelector">
          <Option value="share">分享</Option>
          <Option value="release">上线</Option>
        </Select>
      </FormItem>

      <FormItem label="任务" prop="tasks">
        <editor ref="editorInst" :content="shareData.content"></editor>
      </FormItem>

      <FormItem label="机器人" prop="botId">
        <Select v-model="shareData.botId" style="width:180px" aria-label="botSelector">
          <Option v-for="bot in project.bots" :value="bot.id" :key="bot.id">
            {{ bot.name }}
          </Option>
        </Select>
      </FormItem>
      <FormItem label="@群成员" prop="atMode">
        <RadioGroup v-model="shareData.atMode" @on-change="onChangeAtMode">
          <Radio label="0">无</Radio>
          <Radio label="-1">所有人</Radio>
          <Radio label="multi">选择</Radio>
        </RadioGroup>
        <Select v-model="shareData.userIds" v-if="shareData.atMode==='multi'"
                style="width:180px"
                multiple aria-label="botSelector"
        >
          <Option v-for="pu in project.users" :value="pu.id" :key="pu.id">
            <img class="aui-user-selector-avatar" :src="pu.avatar || defaultAvatar" alt="avatar"/>
            {{ pu.nickname }}
          </Option>
        </Select>
      </FormItem>
    </Form>
    <template #footer>
      <Button slot="footer" @click="onSubmit">确定</Button>
    </template>
  </Modal>
</template>

<script setup>
import MessageService from '@/business/message_service';
import defaultAvatar from '@/assets/images/default-avatar.webp'
import {FormItem, Message, Option} from "view-ui-plus";
import {computed, inject, ref} from 'vue'
import Editor from "../editor/editor"

const editorInst = ref()
const project = inject('project')
const props = defineProps(['show', 'tasks'])
const emit = defineEmits(['update:show'])
const form = ref(null)
const shareData = ref({
  title: '今日上线',
  type: 'share',
  botId: 0,
  userIds: [],
  atMode: '0',
  content: ''
})
const users = ref([])
const ruleValidate = {
  title: [
    {required: true, message: '标题是必须的', trigger: 'blur'}
  ]
}

let showModel = computed({
  get() {
    return props.show;
  },
  set(newValue) {
    emit('update:show', newValue);
  }
})

const onVisibleChange = (isShow) => {
  if (!isShow) return
  shareData.value.content = shareContent.value
}

let shareContent = computed(() => {
  const contentList = []
  props.tasks.sort((a, b) => a.id > b.id)
  for (let task of props.tasks) {
    let assignorNames = []
    task.users.forEach(user => {
      if (user.is_assignor) {
        assignorNames.push(`@${user.nickname}`)
      }
    })
    let taskDesc = `- 【${task.typeName}∙${project.value.prefix}${task.id}】${task.name} ${assignorNames.join(' ')}`
    contentList.push(taskDesc)
  }
  return contentList.join('  \n')
})

const onChangeAtMode = (selectedMode) => {
  switch (selectedMode) {
    case '0':
      shareData.value.userIds = []
      break
    case '-1':
      shareData.value.userIds = [-1]
      break
  }
}

const onSubmit = () => {
  form.value.validate((valid) => {
    if (valid) {
      let content = editorInst.value.getContent()
      if (shareData.value.atMode === 'multi') {
        props.tasks.forEach(task => {
          task.users.forEach(user => {
            if (shareData.value.userIds.includes(user.id)) {
              const target = `@${user.nickname}`
              const dest = `@${user.phone}`
              content = content.replaceAll(target, dest)
            }
          })
        })
      }
      MessageService.sendMessage(
          project.value.id,
          shareData.value.botId,
          shareData.value.title,
          shareData.value.type,
          content,
          shareData.value.userIds
      ).then(() => {
        resetForm()
        emit('update:show', false)
      }).catch(e => {
        Message.error(e.errMsg || '发送失败')
      })
    }
  })
}

const cancel = () => {
  resetForm()
}

const resetForm = () => {
  form.value.resetFields();
}

</script>

<style scoped lang="less">

</style>
