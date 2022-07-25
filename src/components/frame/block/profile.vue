<template>
  <Dropdown :style="dropDownStyle" trigger="click" placement="bottom" @on-click="onClickItem">
    <Avatar v-if="avatar" :src="avatar" class="aui-profile-avatar"/>
    <Avatar v-else style="background-color: #2d8cf0">{{nickname[0]}}</Avatar>

    <template #list>
      <DropdownMenu>
        <DropdownItem name="modeProfile">编辑</DropdownItem>
        <DropdownItem name="modePwd">修改密码</DropdownItem>
        <DropdownItem name="logout">退出</DropdownItem>
      </DropdownMenu>
    </template>

    <password-model
        v-model:show="showPwdModel"
    ></password-model>
    <user-model
        v-model:show="showUserModel"
        :user="{nickname, avatar}"
        mode="update"
    ></user-model>
  </Dropdown>
</template>

<script>
import helper from '@/utils/helper';
import PasswordModel from '../../model/password_model';
import UserModel from '@/components/model/user_model';
import {events, EventBus} from '@/service/event_bus'
import Cookies from 'js-cookie';

export default {
  beforeCreate() {
    let token = Cookies.get('token');
    if (!token) {
      this.$router.replace({'name': 'login'})
    }

    EventBus.on(events.USER_UPDATED, (user) => {
      this.nickname = user.nickname
      this.avatar = user.avatar
      helper.storage.set('nickname', user.nickname);
      helper.storage.set('avatar', user.avatar);
    })
  },
  data() {
    return {
      showPwdModel: false,
      showUserModel: false,
      dropDownStyle: 'margin-left: 20px;cursor: pointer;line-height:1.5',
      nickname: helper.storage.get('nickname'),
      avatar: helper.storage.get('avatar'),
    }
  },
  components: {
    PasswordModel,
    UserModel
  },
  methods: {
    onClickItem(name) {
      if (name === 'modePwd') {
        this.ShowPwdModel();
      } else if (name === 'modeProfile') {
        this.showEditProfileModel();
      } else if (name === 'logout') {
        this.logout();
      }
    },
    ShowPwdModel() {
      this.showPwdModel = true;
    },
    showEditProfileModel() {
      this.showUserModel = true;
    },
    logout() {
      Cookies.remove('token');
      helper.storage.clear();
      this.$router.replace({'name': 'index'})
    }
  }
}
</script>

<style scoped lang="less">
.aui-profile-avatar{
  transform: scale(1.2);
  &:hover{
    transform: scale(1.3);
  }
}
</style>
