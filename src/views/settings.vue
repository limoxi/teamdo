<template>
  <top-frame>
    <template #header>
      <Header/>
    </template>
    <template #content>
      <div class="aui-sys-settings">
        <List class="aui-i-menu" border split>
          <ListItem :class="`aui-i-menu-item ${activeMenu==='sys'? 'active-list-item': ''}`" @click="onClickMenu('sys')">系统配置</ListItem>
          <ListItem :class="`aui-i-menu-item ${activeMenu==='bots'? 'active-list-item': ''}`" @click="onClickMenu('bots')">机器人配置</ListItem>

        </List>
        <div class="aui-i-content">
          <template v-else-if="activeMenu === 'sys'">
            <H4>开发中...</H4>
          </template>
          <template v-else-if="activeMenu === 'bots'">
            <Button icon="md-add" @click="botModal.show()" class="aui-i-add-btn">添加机器人</Button>
            <div class="aui-i-bots">
              <div class="aui-i-bot" v-for="bot in bots" :key="bot.id">
                <Avatar :src="bot.avatar"></Avatar>
                <p>{{ bot.name }}</p>
              </div>
            </div>
          </template>
        </div>
      </div>
    </template>
  </top-frame>
  <BotModal ref="botModal" @on-submitted="loadBots"></BotModal>
</template>

<script setup>
import TopFrame from '@/components/frame/top_frame';
import Header from '@/components/frame/header/header';
import {Avatar, Divider, Message, Modal} from "view-ui-plus";
import {computed, inject, ref} from "vue";
import BotModal from '@/components/modal/bot_modal'
import BotService from "@/business/bot_service";

const activeMenu = ref('tags')
const botModal = ref(null)

const bots = ref([])

const onClickMenu = menuItem => {
  activeMenu.value = menuItem
  switch (menuItem) {
    case 'sys':
      break
    case 'bots':
      loadBots()
      break
  }
}

const loadBots = () => {
  BotService.getAllBots().then(records => {
    bots.value = records
  }).catch(e => {
    Message.error(e.errMsg || '加载标签失败');
  })
}

</script>

<style scoped lang="less">
.aui-sys-settings{
  display: flex;
  margin: 15px 30px;

  .aui-i-menu{
    height: calc(100vh - 80px);
    min-width: 20vw;
    margin-right: 15px;
  }

  .aui-i-content{
    min-width: 75vw;
    height: calc(100vh - 80px);
    overflow-y: scroll;
    overflow-x: hidden;
  }
}


</style>