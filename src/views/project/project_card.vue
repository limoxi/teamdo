<template>
  <div @click="onClickCard">
    <Card class="aui-project-card">
      <template #title>
        <span class="aui-i-name">{{ project.name }}</span>
        <span>
          <Tooltip :content="bot.name" placement="top"
                 v-for="bot in project.bots" :key="bot.id">
            <Avatar
                :src="bot.avatar || defaultBotAvatar"
                shape="square"
                @click="onClickBot($event, bot)"
            />
          </Tooltip>

          <Tooltip content="点击添加群机器人" placement="right">
              <Icon type="logo-android"
                  size="22" color="#19be6b"
                  @click="onAddBot($event)"
              />
          </Tooltip>
        </span>
      </template>
      <template #extra>
        <span class="aui-i-action">
          <Button size="large" type="text" icon="md-create" @click="onEdit"></Button>
          <Button size="large" type="text" icon="md-trash" @click="onDelete"></Button>
        </span>
      </template>

      <p>{{ project.desc }}</p>
      <p class="aui-i-users">
        <AvatarList :list="avatars" />
      </p>
      <p class="aui-i-time">{{ project.created_at }}</p>
    </Card>
  </div>
</template>

<script setup>
import {Modal} from 'view-ui-plus'
import defaultAvatar from '@/images/default-avatar.webp';
import defaultBotAvatar from '@/images/default-bot-avatar.png';
import {events, EventBus} from '@/service/event_bus'
import {useRouter} from 'vue-router'
const router = useRouter()

const props = defineProps(['project'])

const avatars = props.project.users.map(user => {
  return {
    src: user.avatar || defaultAvatar,
    tip: user.nickname
  }
})

const onClickBot = (e, bot) => {
  e.stopPropagation()
  EventBus.emit(events.UPDATE_BOT, props.project, bot)
}

const onAddBot = (e) => {
  e.stopPropagation()
  EventBus.emit(events.ADD_BOT, props.project)
}

const onClickCard = () => {
  router.push({
    name: 'kanban',
    params: {
      name: props.project.name,
      projectId: props.project.id
    }
  })
}

const onEdit = (e) => {
  e.stopPropagation();
  EventBus.emit(events.EDIT_PROJECT, props.project)
}

const onDelete = (e) => {
  e.stopPropagation();
  Modal.confirm({
    title: '删除项目',
    content: '<strong>确定要删除该项目么？</strong><p>删除后该项目关联的所有数据都将一并清除！！！</p>',
    okText: '确认',
    cancelText: '再想想',
    onOk: () => {
      EventBus.emit(events.DELETE_PROJECT, props.project)
    }
  });
}

</script>

<style lang="less">
.aui-project-card {
  &:hover {
    .aui-i-action {
      display: inline-block;
    }
  }

  cursor: pointer;

  .aui-i-time {
    text-align: right;
  }

  .ivu-card-extra {
    top: 5px;
  }

  .ivu-card-head {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    .aui-i-name{
      font-size: 18px;
      margin-right: 8px;
    }
    .ivu-avatar{
      transform: scale(0.7);
      margin-top: -5px;
    }
  }

  .aui-i-action {
    display: none;

    .ivu-btn-icon-only .ivu-btn-large {
      font-size: 16px;
    }
  }

  .aui-i-users {
    margin-top: 15px;
    margin-bottom: -35px;
    width: 60%;
  }

  .ivu-avatar-list{
   margin-left: 10px;
  }

  .ivu-avatar-list-item{
   margin-left: -10px !important;
  }

  .ivu-avatar{
    border: none !important;
  }
}

</style>
