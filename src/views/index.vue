<template>
  <div class="aui-index">
    <div class="aui-i-bg"></div>
    <div class="aui-i-welcome">
      <div class="aui-i-logo">TeamDo</div>
      <div>
        <strong style="font-size: 18px">“{{ getOutline(0) }}，</strong>
        <strong style="font-size: 18px">{{ getOutline(1) }}”</strong>
      </div>
      <div class="aui-i-action">
        <space>
          <Button type="text" @click="onShowLogin" v-if="hideEntry">登陆</Button>
          <Button type="text" @click="onShowRegister" v-if="hideEntry">注册</Button>
          <Button type="text" :to='{name: "projects"}' v-if="showEntry">项目列表</Button>
        </space>
      </div>
    </div>
    <login-modal v-model:show="showLogin"></login-modal>
    <user-modal
        v-model:show="showRegister"
        v-model:registered="showLogin"
        mode="register">
    </user-modal>
  </div>
</template>

<script>

import LoginModal from '../components/modal/login_modal';
import UserModal from '../components/modal/user_modal';
import helper from '@/utils/helper';
import {Space} from 'view-ui-plus'

export default {
  data() {
    return {
      showLogin: false,
      showRegister: false,
      randomIndex: Math.floor(Math.random() * 2)
    }
  },
  components: {
    Space,
    LoginModal,
    UserModal
  },
  computed: {
    showEntry() {
      return !!helper.storage.get('token')
    },
    hideEntry() {
      return !helper.storage.get('token');
    }
  },
  methods: {
    onShowLogin() {
      this.showRegister = false;
      this.showLogin = true;
    },
    onShowRegister() {
      this.showLogin = false;
      this.showRegister = true;
    },
    onRegistered() {
      this.showLogin = true;
    },
    getOutline(index) {
      const outlines = [
        ['嘈杂No', '专注Yes'],
        ['人生如戏', '戏如人生']
      ]
      return outlines[this.randomIndex][index]
    }
  }
}
</script>

<style scoped lang="less">
.aui-index {
  user-select: none;

  .aui-i-bg {
    position: fixed;
    width: 100vw;
    height: 100vh;
    background-image: url("@/assets/images/index-bg.svg");
    background-position: center center;
    background-repeat: no-repeat;
    background-size: cover;

    &::before {
      content: '';
      backdrop-filter: blur(8px);
      width: 100%;
      height: 100%;
      position: absolute;
    }
  }

  .aui-i-welcome {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100vw;
    height: 75vh;

    strong {
      font-size: 30px;
    }

    .aui-i-logo {
      font-size: 90px;
      font-family: teamdo;
      margin-bottom: 15px;
    }

    .aui-i-action {
      margin-top: 20px;
      font-size: 26px;

      .ivu-btn-text {
        color: #444 !important;
        border-radius: 15px;
        padding: 0 15px;

        &:hover {
          color: #bbb !important;
          background: #444;
        }
      }
    }
  }
}
</style>
