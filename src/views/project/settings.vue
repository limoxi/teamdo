<template>
  <div class="aui-project-settings">
    <List class="aui-i-menu" border split>
      <ListItem :class="`aui-i-menu-item ${activeMenu==='project'? 'active-list-item': ''}`" @click="onClickMenu('project')">项目配置</ListItem>
      <ListItem :class="`aui-i-menu-item ${activeMenu==='bots'? 'active-list-item': ''}`" @click="onClickMenu('bots')">机器人配置</ListItem>
      <ListItem :class="`aui-i-menu-item ${activeMenu==='tags'? 'active-list-item': ''}`" @click="onClickMenu('tags')">标签配置</ListItem>

    </List>
    <div class="aui-i-content">
      <template v-if="activeMenu === 'project'">
        <H4>开发中...</H4>
      </template>
      <template v-else-if="activeMenu === 'bots'">
        <Button icon="md-add" @click="botSelectModal.show()" class="aui-i-add-btn">添加机器人</Button>
        <div class="aui-i-bots">
          <Card class="aui-i-bot" v-for="bot in bots" :key="bot.id" :bordered="false">
            <Avatar class="aui-i-avatar" :src="bot.avatar"></Avatar>
            <h3>{{ bot.name }}</h3>
            <template #extra>
              <Button icon="md-close-circle" type="text" @click.prevent="onDeleteBot(bot)"></Button>
            </template>
          </Card>
        </div>
        <BotSelectModal ref="botSelectModal" @on-selected="onSelectBot"></BotSelectModal>
      </template>
      <template v-else-if="activeMenu === 'tags'">
        <Button icon="md-add" @click="tagModal.show()" class="aui-i-add-btn">新增标签</Button>
        <div class="aui-i-tags" v-for="bizCode in ['normal_task', 'epic_task']" :key="bizCode">
          <h4 class="aui-i-tags-title">{{ bizCode === 'normal_task'? '看板标签' : '需求标签' }}</h4>
          <Tag class="aui-i-tag" type="dot" closable :color="tag.color"
               v-for="tag in tags.filter(t => t.biz_code === bizCode)" :key="tag.id"
               @on-close="onDeleteTag(tag)"
               @click="tagModal.show(tag)"
          >
            {{ tag.name }}
          </Tag>
        </div>
        <TagModal ref="tagModal"
                  :projectId="project?.id || 0"
                  @update="reloadTags"></TagModal>
      </template>
    </div>
  </div>

</template>

<script setup>
import {Avatar, Button, Message, Modal} from "view-ui-plus";
import {computed, inject, ref} from "vue";
import TagModal from '@/components/modal/tag_modal'
import BotSelectModal from '@/components/modal/bot_select_modal'
import TagService from '@/business/tag_service';

const project = inject('project')

const activeMenu = ref('tags')
const tagModal = ref(null)
const botSelectModal = ref(null)

const onClickMenu = menuItem => {
  activeMenu.value = menuItem
}

const reloadTags = () => {
  project.value.reloadTags().catch(e => {
    Message.error(e.errMsg || '加载标签失败');
  })
}

const tags = computed(() => {
  return project.value?.tags || []
})

const bots = computed(() => {
  return project.value?.bots || []
})

const onDeleteBot = bot => {
  Modal.confirm({
    title: '移除机器人',
    content: `<strong>确定要移除机器人【${bot.name}】么？`,
    okText: '确认',
    cancelText: '再想想',
    onOk: () => {
      project.value.deleteBot(bot.id).then(() => {
        project.value.reloadBots().catch(e => {
          Message.error(e.errMsg || '刷新机器人列表失败');
        })
      }).catch(e => {
        console.error(e)
        Message.error(e.errMsg || '删除机器人失败')
      })
    }
  });
}

const onSelectBot = selectedBotId => {
  project.value.addBot(selectedBotId).then(() => {
    project.value.reloadBots().catch(e => {
      Message.error(e.errMsg || '刷新机器人列表失败');
    })
  }).catch(e => {
    console.error(e)
    Message.error(e.errMsg || '添加机器人失败')
  })
}

const onDeleteTag = tag => {
  Modal.confirm({
    title: '删除标签',
    content: `确认删除标签：${tag.name}么`,
    loading: true,
    onOk: () => {
      TagService.deleteTag(
          project.value.id,
          tag.id
      ).then(() => {
        reloadTags()
        Message.success('删除成功');
        Modal.remove()
      }).catch(err => {
        console.error(err)
        Message.error(err.errMsg);
      });
    }
  });
}

</script>

<style scoped lang="less">
.aui-project-settings{
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

    .aui-i-bots{
      display: flex;
      justify-content: flex-start;

      .aui-i-bot{
        width: 150px;
        margin-top: 15px;
        margin-right: 5px;
        margin-left: 1px;
        text-align: center;
        background: transparent;
        .aui-i-avatar{
          margin-top: 5px;
          margin-bottom: 5px;
          width: 80px;
          height: 80px;
        }
        .ivu-card-extra{
          position: absolute;
          top: 0 !important;
          right: 0 !important;
        }
      }
    }

    .aui-i-tags{
      position: relative;
      margin-top: 30px;

      .aui-i-tags-title{
        display: block;
        position: absolute;
        top: -20px;
      }
    }
  }
}


</style>