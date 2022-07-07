<template>
  <Dropdown :style="dropDownStyle" trigger="click" placement="bottom-end" @on-click="onClickItem">
    <Badge dot>
      <Button>
        <Icon type="md-person" size="15"/>
        <span>{{ nickname }}</span>
        <Icon type="ios-arrow-down"></Icon>
      </Button>
    </Badge>

    <template #list>
      <DropdownMenu>
        <DropdownItem name="modeProfile">编辑</DropdownItem>
        <DropdownItem name="modePwd">修改密码</DropdownItem>
        <DropdownItem name="message">
          <Icon type="md-notifications" style="margin-right:5px;"></Icon>
          消息
        </DropdownItem>
        <DropdownItem name="logout">退出</DropdownItem>
      </DropdownMenu>
    </template>

    <password-model
        v-model:show="showPwdModel"
    ></password-model>
    <user-model
        v-model:show="showUserModel"
        mode="update"
    ></user-model>
    <Drawer title="新消息" placement="right" :closable="false" v-model="showMessages">
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
    </Drawer>
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
      this.nickname = user.nickname;
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
      showMessages: false
    }
  },
  components: {
    'password-model': PasswordModel,
    'user-model': UserModel,
  },
  methods: {
    onClickItem(name) {
      if (name === 'modePwd') {
        this.ShowPwdModel();
      } else if (name === 'modeProfile') {
        this.showEditProfileModel();
      } else if (name === 'message') {
        this.handleMessages();
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
    handleMessages() {
      this.showMessages = true;
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

</style>
