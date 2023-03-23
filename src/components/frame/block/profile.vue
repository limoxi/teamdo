<template>
  <Dropdown :style="dropDownStyle" trigger="click" placement="bottom-end" @on-click="onClickItem">
    <Avatar v-if="avatar" :src="avatar" class="aui-profile-avatar"/>
    <Avatar v-else style="background-color: #2d8cf0">{{ nickname[0] }}</Avatar>

    <template #list>
      <DropdownMenu>
        <DropdownItem name="modeProfile">编辑</DropdownItem>
        <DropdownItem name="modePwd">修改密码</DropdownItem>
        <DropdownItem name="myTasks">我的任务</DropdownItem>
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
import helper from '@/utils/helper';
import PasswordModal from '../../modal/password_modal';
import UserModal from '@/components/modal/user_modal';
import Cookies from 'js-cookie';
import {onMounted, ref} from "vue";
import {storeToRefs} from 'pinia';
import {useUserStore} from '@/store'
import {useRouter} from 'vue-router'

const router = useRouter()

const dropDownStyle = 'margin-left: 20px;cursor: pointer;line-height:1.5'

const userStore = useUserStore()
const {nickname, avatar} = storeToRefs(userStore)

let showPwdModel = ref(false)
let showUserModel = ref(false)

onMounted(() => {
  let token = Cookies.get('token');
  if (!token) {
    router.replace({'name': 'index'})
  }
})

const onClickItem = (name) => {
  if (name === 'modePwd') {
    ShowPwdModel();
  } else if (name === 'modeProfile') {
    showEditProfileModel();
  } else if (name === 'myTasks') {
    router.push({
      name: 'myTasks'
    });
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
