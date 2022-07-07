<template>
  <Modal
      v-model="showModel"
      :title="title"
      width="365"
  >
    <Login @on-submit="handleSubmit">
      <template #content v-if="isUpdateMode">
        <div style="margin-left:43px;">
          <uploader
              ref="upload"
              v-model:src="user.avatar"
          >
          </uploader>
        </div>
      </template>
      <Mobile name="username" :value="user.username" placeholder="请输入手机号" :readonly="isUpdateMode" />
      <UserName name="nickname" :value="user.nickname" placeholder="请输入姓名" />
      <Password v-if="!isUpdateMode" name="password" :value="user.password" placeholder="请输入密码" />
      <Submit />
    </Login>
    <template #footer>
      <span style="display: none"></span>
    </template>
  </Modal>
</template>
<script>
import helper from '@/utils/helper';
import Uploader from '@/components/uploader';
import UserService from '@/service/user_service';
import {events, EventBus} from '@/service/event_bus'

export default {
  components: {
    'uploader': Uploader
  },
  props: ['show', 'mode'],
  data() {
    return {
      user: {
        username: '',
        nickname: '',
        avatar: '',
        password: '',

      }
    }
  },
  computed: {
    title() {
      return this.isRegisterMode ? '注册' : '编辑';
    },
    showModel: {
      get() {
        if (this.show) {
          if (this.isUpdateMode) {
            UserService.getUser({
              user_id: helper.storage.get('uid'),
            }).then(data => {
              this.user.username = data.username;
              this.user.avatar = data.avatar;
              this.user.nickname = data.nickname;
            }).catch(err => {
              this.$Message.error('获取用户信息失败');
            });
          }
        }
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
