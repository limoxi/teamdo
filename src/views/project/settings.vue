<template>
  <div class="aui-project-settings">
    <List class="aui-i-menu" border split>
      <ListItem :class="`aui-i-menu-item ${activeMenu==='project'? 'active-list-item': ''}`" @click="onClickMenu('project')">
        <Icon style="transform: scale(1.4)" type="md-settings" />&nbsp;&nbsp;项目配置
      </ListItem>
      <ListItem :class="`aui-i-menu-item ${activeMenu==='roles'? 'active-list-item': ''}`" @click="onClickMenu('roles')">
        <Icon style="transform: scale(1.4)" type="md-ribbon" />&nbsp;&nbsp;项目角色
      </ListItem>
      <ListItem :class="`aui-i-menu-item ${activeMenu==='bots'? 'active-list-item': ''}`" @click="onClickMenu('bots')">
        <Icon style="transform: scale(1.4)" type="logo-android" />&nbsp;&nbsp;机器人
      </ListItem>
      <ListItem :class="`aui-i-menu-item ${activeMenu==='tags'? 'active-list-item': ''}`" @click="onClickMenu('tags')">
        <Icon style="transform: scale(1.4)" type="md-pricetags" />&nbsp;&nbsp;标签
      </ListItem>

    </List>
    <div class="aui-i-content">
      <template v-if="activeMenu === 'project'">
        <Card>
          <template #title>
            <span>机器人播报&nbsp;&nbsp;&nbsp;&nbsp;</span>
            <i style="color: darkgrey;font-size: 12px">
              <Icon type="md-alert" />每天下班时间向机器人所在群发送项目研发情况</i>
          </template>
          <div style="display: flex;justify-content: flex-start; margin-bottom: 10px">
            <div style="margin-right: 15px">
              <Select v-model="botTask.botId"
                      style="width:180px"
                      @on-change="onSaveBotTask"
              >
                <Option v-for="pb in project.bots" :value="pb.id" :key="pb.id">
                  <img class="aui-user-selector-avatar" :src="pb.avatar || defaultBotAvatar" alt="avatar"/>
                  {{ pb.name }}
                </Option>
              </Select>
            </div>
            <div>
              <CheckboxGroup v-model="botTask.laneIds" @on-change="onSaveBotTask">
                <Checkbox style="margin-bottom: 5px" v-for="lane in project.kanbanLanes" :label="lane.id" border>{{ lane.name }}</Checkbox>
              </CheckboxGroup>
            </div>
          </div>
        </Card>
      </template>
      <template v-else-if="activeMenu === 'roles'">
        <Button icon="md-add" @click="" style="margin-bottom: 15px">添加角色</Button>
        <Table border :columns="roleColumns" :data="project.roles || []"></Table>
      </template>
      <template v-else-if="activeMenu === 'bots'">
        <Button icon="md-add" @click="botSelectModal.show()" class="aui-i-add-btn">添加机器人</Button>
        <div class="aui-i-bots">
          <Card class="aui-i-bot" v-for="bot in bots" :key="bot.id">
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
        <Button icon="md-add" @click="tagModal.show()">新增标签</Button>
        <div class="aui-i-tags">
          <Card v-for="bizCode in ['normal_task', 'epic_task']" :key="bizCode">
            <template #title>{{ bizCode === 'normal_task'? '看板标签' : '需求标签' }}</template>
            <Tag type="dot" closable :color="tag.color"
                 v-for="tag in tags.filter(t => t.biz_code === bizCode)" :key="tag.id"
                 @on-close="onDeleteTag(tag)"
                 @click="tagModal.show(tag)"
            >
              {{ tag.name }}
            </Tag>
          </Card>
        </div>
        <TagModal ref="tagModal"
                  :projectId="project?.id || 0"
                  @update="reloadTags"></TagModal>
      </template>
    </div>
  </div>

</template>

<script setup>
import {
  Avatar,
  Button,
  Card,
  Checkbox,
  CheckboxGroup,
  Icon,
  List,
  ListItem,
  Message,
  Modal,
  Option,
  Tag
} from 'view-ui-plus'
import {computed, inject, ref} from 'vue'
import ProjectService from '@/business/project_service'
import TagModal from '@/components/modal/tag_modal'
import BotSelectModal from '@/components/modal/bot_select_modal'
import TagService from '@/business/tag_service'
import defaultBotAvatar from '@/assets/images/default-bot-avatar.png'

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

const project = inject('project')

const activeMenu = ref('bots')
const tagModal = ref(null)
const botSelectModal = ref(null)
const botTask = ref({
  botId: 0,
  laneIds: []
})

const onClickMenu = menuItem => {
  switch (menuItem){
    case 'project':
      loadBotTask()
  }
  activeMenu.value = menuItem
}

const loadBotTask = () => {
    ProjectService.getBotTask(project.value.id, "stats_lane_task").then(data => {
      botTask.value.botId = data?.bot_id || 0
      botTask.value.laneIds = data?.task_rule?.lane_ids || []
    }).catch(e => {
      console.error(e)
      Message.error(e.errMsg || '加载机器人任务失败')
    })
}

const onSaveBotTask = () => {
  ProjectService.setBotTask(project.value.id, botTask.value.botId, "stats_lane_task", {
    'lane_ids': botTask.value.laneIds
  }).then(() => {
    Message.success('操作成功')
  }).catch(e => {
    console.error(e)
    Message.error(e.errMsg || '操作失败')
  })
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
      margin-top: 15px;
      display: flex;
      justify-content: flex-start;
      flex-direction: row;
      .ivu-card{
        margin-right: 30px;
        min-width: 30vw;
        max-width: 40vw;
      }
    }
  }
}


</style>