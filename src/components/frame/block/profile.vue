<template>
  <Dropdown :style="dropDownStyle" trigger="click" placement="bottom-end" @on-click="onClickItem">
    <Avatar v-if="avatar" :src="avatar" class="aui-profile-avatar"/>
    <Avatar v-else style="background-color: #2d8cf0">{{ nickname[0] }}</Avatar>
    <Badge style="position: absolute; bottom: 0;display: inline-block" :status="remoteServerEventStatus" />

    <template #list>
      <DropdownMenu>
        <DropdownItem name="modeProfile">编辑</DropdownItem>
        <DropdownItem name="modePwd">修改密码</DropdownItem>
        <DropdownItem name="userTasks">我的任务</DropdownItem>
        <DropdownItem name="logout">退出</DropdownItem>
      </DropdownMenu>
    </template>

    <password-modal
        v-model:show="showPwdModel"
    ></password-modal>
    <user-modal
        v-model:show="showUserModel"
        :user="{'nickname': nickname, 'avatar': avatar}"
        mode="update"
    ></user-modal>
  </Dropdown>
</template>

<script setup>
import helper from '@/utils/helper'
import PasswordModal from '../../modal/password_modal'
import UserModal from '@/components/modal/user_modal'
import Cookies from 'js-cookie'
import {onMounted, ref} from "vue";
import {storeToRefs} from 'pinia';
import {useUserStore} from '@/store'
import {useRouter} from 'vue-router'
import {Message} from 'view-ui-plus'
import { EventSourcePolyfill } from 'event-source-polyfill'

const router = useRouter()

const dropDownStyle = 'margin-left: 20px;cursor: pointer;line-height:1.5; position:relative'

const userStore = useUserStore()
const {uid, nickname, avatar} = storeToRefs(userStore)

let showPwdModel = ref(false)
let showUserModel = ref(false)
let remoteServerEventStatus = ref('default')
let toaster = ref(null)

onMounted(() => {
  let token = Cookies.get('token');
  if (!token) {
    router.replace({'name': 'index'})
  }

  initNotify()
  waitServerMessage()
})

const initNotify = () => {
  if (!("Notification" in window)) {
    Message.warning("当前浏览器不支持桌面通知")
    return
  }
  if (!window.isSecureContext) {
    Message.warning('请使用https访问')
    return
  }
  if (Notification.permission !== 'granted') {
    Notification.requestPermission().then(permission => {
      if(permission !== 'granted') {
        Message.warning('请打开桌面通知，以免漏接消息')
      }
    })
  }
}

const waitServerMessage = () => {
  const es = new EventSourcePolyfill('/iteamdo/message/user_realtime_message/', {
    headers: {
      'Authorization': Cookies.get('token'),
    },
    heartbeatTimeout: 5 * 60 * 60 * 1000  // 最大5小时
  })
  es.onopen = event => {
    remoteServerEventStatus.value = 'success'
  }
  es.onerror = event => {
    console.error(event)
    remoteServerEventStatus.value = 'error'
  }
  es.addEventListener(`user_event_${uid.value}`, event => {
    remoteServerEventStatus.value = 'success'
    const eventData = JSON.parse(event.data)
    new Notification(eventData.title, {
      body: eventData.content,
      icon: location.origin + '/favicon.ico',
      requireInteraction: true
    })
  }, false)
}

const onClickItem = (name) => {
  if (name === 'modePwd') {
    ShowPwdModel();
  } else if (name === 'modeProfile') {
    showEditProfileModel();
  } else if (name === 'userTasks') {
    location.href = '/user_tasks'
  } else if (name === 'logout') {
    logout();
  }
}
const ShowPwdModel = () => {
  showPwdModel.value = true
}
const showEditProfileModel = () => {
  showUserModel.value = true;
}
const logout = () => {
  Cookies.remove('token');
  helper.storage.clear();
  router.replace({'name': 'index'})
}

</script>

<style scoped lang="less">
.aui-profile-avatar {
  transform: scale(1.2);

  &:hover {
    transform: scale(1.3);
  }
}
</style>
