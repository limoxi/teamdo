<style scoped lang="less">
.aui-uploader-wrapper{
  margin-bottom: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
<template>
  <Modal
      v-model="showModel"
      :title="title"
      width="365"
      :footer-hide="true"
  >
    <Login @on-submit="handleSubmit">
      <div v-if="isUpdateMode" class="aui-uploader-wrapper">
        <uploader
            ref="upload"
            v-model:src="userForm.avatar"
        >
        </uploader>
      </div>
      <Mobile v-if="!isUpdateMode" name="username" v-model:username="userForm.username" placeholder="请输入手机号" />
      <UserName name="nickname" :value="userForm.nickname" placeholder="请输入姓名" />
      <Password v-if="!isUpdateMode" name="password" placeholder="请输入密码" />
      <Submit>{{ btnText }}</Submit>
    </Login>
  </Modal>
</template>
<script>
import helper from '@/utils/helper';
import Uploader from '@/components/uploader';
import UserService from '@/service/user_service';
import {events, EventBus} from '@/service/event_bus'

export default {
  components: {
    Uploader
  },
  props: ['show', 'mode', 'user'],
  data() {
    return {
      userForm: {
        username: '',
        nickname: this.user ? this.user.nickname : '',
        avatar: this.user ? this.user.avatar : ''
      }
    }
  },
  computed: {
    title() {
      return this.isRegisterMode ? '注册' : '编辑';
    },
    showModel: {
      get() {
        return this.show;
      },
      set(newValue) {
        this.$emit('update:show', newValue);
      }
    },
    isRegisterMode() {
      return this.mode === 'register';
    },
    isUpdateMode() {
      return this.mode === 'update';
    },
    btnText () {
      return this.isRegisterMode ? '注册' : '提交'
    }
  },
  methods: {
    handleSubmit(valid, { username, nickname, password }) {
      if (valid) {
          if (this.isRegisterMode) {
            UserService.doRegister({
              username: username,
              avatar: this.user.avatar,
              password: password,
              nickname: nickname,
            }).then(() => {
              this.$Message.success('注册成功,可以登录了~');
              this.$emit('update:registered', true);
              this.showModel = false;
            }).catch(err => {
              this.$Message.error(err.errMsg);
            });
          }

          if (this.isUpdateMode) {
            UserService.updateUser({
              avatar: this.user.avatar,
              nickname: nickname,
            }).then(() => {
              EventBus.emit(events.USER_UPDATED, this.user);
              this.showModel = false;
              this.$Message.success('修改信息成功~');
            }).catch(err => {
              this.$Message.error(err.errMsg);
            });
          }
      }
    }
  }
}
</script>
