<template>
  <Modal
      v-model="showModal"
      title="选择机器人"
      width="720"
      @on-cancel="onCancel"
      class="aui-bots-select-modal"
  >
    <div class="aui-i-list">
        <Card :bordered="false" v-for="bot in bots" :key="bot.id" @click="onToggleBot(bot)" class="aui-i-bot">
        <Avatar class="aui-i-avatar" :src="bot.avatar"></Avatar>
        <h2>{{ bot.name }}</h2>
        <p>{{ bot.remark }}</p>
        <template #extra>
          <Icon v-if="selectedBotId === bot.id" class="aui-i-selector" type="ios-checkmark-circle" />
        </template>
      </Card>
    </div>
    <template #footer>
      <Button @click="onConfirm">确定</Button>
    </template>
  </Modal>
</template>

<script setup>
import {onMounted, ref} from "vue"
import {Avatar, Message, Modal} from 'view-ui-plus'
import BotService from '@/business/bot_service'
import _ from "lodash";

const showModal = ref(false)
const emit = defineEmits(['onSelected'])

const bots = ref([])
const selectedBotId = ref(0)

onMounted(() => {
  loadBots()
})

const loadBots = () => {
  BotService.getAllBots().then(records => {
    bots.value = records
  }).catch(e => {
    console.error(e)
    Message.error(e.errMsg || '加载机器人失败')
  })
}

const onToggleBot = bot => {
  if (selectedBotId.value === bot.id) {
    selectedBotId.value = 0
  } else {
    selectedBotId.value = bot.id
  }
}

const onConfirm = () => {
  emit('onSelected', selectedBotId.value)
  showModal.value = false
}

const onCancel = () => {
  showModal.value = false
}

const show = () => {
  selectedBotId.value = 0
  showModal.value = true
}

defineExpose({
  show
})

</script>

<style lang="less">
.aui-bots-select-modal{
  .aui-i-list{
    display: flex;
    justify-content: flex-start;
    flex-wrap: nowrap;
    .aui-i-bot{
      width: 200px;
      margin-left: 5px;
      text-align: center;
      .aui-i-avatar{
        width: 100px;
        height: 100px;
      }
      .aui-i-selector{
        color: #19be6b;
        transform: scale(1.6);
      }
    }
  }
}
</style>
