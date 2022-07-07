<template>
  <Modal
      v-model="showModel"
      title="登陆"
      width="360"
      :mask-closable="false"
  >
    <Login @on-submit="handleSubmit">
      <Mobile name="phone" placeholder="请输入手机号" />
      <Password name="password" placeholder="请输入密码" />
      <Submit />
    </Login>
    <template #footer>
      <span style="display: none"></span>
    </template>
  </Modal>
</template>
<script>
import UserService from '@/service/user_service';
import helper from '@/utils/helper';
import Cookies from "js-cookie";

export default {
  props: ['show'],
  data() {
    return {
    }
  },
  computed: {
    showModel: {
      get() {
        return this.show;
      },
      set(newValue) {
        this.$emit('update:show', newValue);
      }
    }
  },
  methods: {
    handleSubmit(valid, { phone, password }) {
      if(!valid) {
        this.$Message.error('登录失败');
        return
      }
      UserService.doLogin(phone, password).then(data => {
        helper.storage.set('uid', data.id);
        helper.storage.set('nickname', data.nickname);
        helper.storage.set('avatar', data.avatar);
        Cookies.set('token', data.token);

        this.showModel = false;
        this.$Message.success({
          content: '登陆成功, 正在跳转页面...',
          onClose: () => {
            this.$router.replace({name: 'projects'});
          }
        })
      }).catch(err => {
        this.$Message.error(err.errMsg);
      });
    }
  }
}
</script>

<style scoped lang="less">

</style>
