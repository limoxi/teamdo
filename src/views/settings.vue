<template>
  <top-frame>
    <template #header>
      <Header/>
    </template>
    <template #content>
      <div class="aui-sys-settings">
        <List class="aui-i-menu" border split>
          <ListItem :class="`aui-i-menu-item ${activeMenu==='sys'? 'active-list-item': ''}`" @click="onClickMenu('sys')">
            <Icon style="transform: scale(1.4)" type="md-settings" />&nbsp;&nbsp;系统配置
          </ListItem>
          <ListItem :class="`aui-i-menu-item ${activeMenu==='roles'? 'active-list-item': ''}`" @click="onClickMenu('roles')">
            <Icon style="transform: scale(1.4)" type="md-ribbon" />&nbsp;&nbsp;系统角色
          </ListItem>
          <ListItem :class="`aui-i-menu-item ${activeMenu==='bots'? 'active-list-item': ''}`" @click="onClickMenu('bots')">
            <Icon style="transform: scale(1.4)" type="logo-android" />&nbsp;&nbsp;机器人
          </ListItem>
        </List>
        <div class="aui-i-content">
          <template v-if="activeMenu === 'sys'">
            <H4>开发中...</H4>
          </template>
          <template v-else-if="activeMenu === 'roles'">
            <Button icon="md-add" @click="" style="margin-bottom: 15px">添加角色</Button>
            <Table border :columns="roleColumns" :data="roles || []"></Table>
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
import {Avatar, Button, Divider, Message, Modal} from "view-ui-plus";
import {computed, inject, ref} from "vue";
import BotModal from '@/components/modal/bot_modal'
import BotService from "@/business/bot_service";

const activeMenu = ref('tags')
const botModal = ref(null)

const roleColumns = [
  {
    title: '角色名称',
    key: 'name',
    width: 200
  }, {
    title: '操作',
    key: 'action'
  }
]
const roles = ref([])
const bots = ref([])

const onClickMenu = menuItem => {
  switch (menuItem) {
    case 'sys':
      loadRoles()
      break
    case 'roles':
      break
    case 'bots':
      loadBots()
      break
  }
  activeMenu.value = menuItem
}

const loadRoles = () => {

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