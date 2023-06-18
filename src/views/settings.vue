<template>
  <div class="aui-settings">
    <List class="aui-i-menu" border split>
      <ListItem :class="`aui-i-menu-item ${activeMenu==='system'? 'active-list-item': ''}`" @click="onClickMenu('system')">全局配置</ListItem>
      <ListItem :class="`aui-i-menu-item ${activeMenu==='roles'? 'active-list-item': ''}`" @click="onClickMenu('roles')">角色配置</ListItem>
    </List>
    <div class="aui-i-content">
      <template v-if="activeMenu === 'system'">
      </template>
      <template v-else-if="activeMenu === 'roles'">
        <H4>开发中...</H4>
      </template>
    </div>
  </div>

</template>

<script setup>
import {Divider, Message, Modal} from "view-ui-plus";
import {computed, inject, ref} from "vue";
import TagModal from '@/components/modal/tag_modal'
import TagService from '@/business/tag_service';

const activeMenu = ref('tags')

const onClickMenu = menuItem => {
  activeMenu.value = menuItem
}

</script>

<style scoped lang="less">
.aui-settings{
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