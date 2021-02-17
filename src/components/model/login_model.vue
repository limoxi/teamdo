<template>
  <Modal
      v-model="showModel"
      title="登陆"
      width="360"
  >
    <Form ref="loginForm" :model="loginUser" :rules="ruleValidate" :label-width="80">
      <FormItem label="登录名" prop="username">
        <Input v-model="loginUser.username" placeholder=""></Input>
      </FormItem>
      <FormItem label="密码" prop="password">
        <Input type="password" v-model="loginUser.password"></Input>
      </FormItem>
    </Form>
    <Button slot="footer" @click="handleSubmit">确定</Button>
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
      loginUser: {
        username: '',
        password: ''
      },
      ruleValidate: {
        username: [
          {required: true, message: '登陆名不能为空', trigger: 'blur'}
        ],
        password: [
          {required: true, message: '密码不能为空', trigger: 'blur'}
        ]
      }
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
    handleSubmit() {
      this.$refs['loginForm'].validate((valid) => {
        if (valid) {
          UserService.doLogin(
              this.loginUser.username,
              this.loginUser.password,
          ).then(data => {
            helper.storage.set('uid', data.id);
            helper.storage.set('nickname', data.nickname);
            helper.storage.set('avatar', data.avatar);
            Cookies.set('token', data.token);

            this.resetForm();
            this.$Message.success('登陆成功, 正在跳转页面...');
            helper.delay(() => {
              this.$router.replace({name: 'projects'});
              this.showModel = false;
            }, 2);
          }).catch(err => {
            this.$Message.error(err.errMsg);
          });
        }
      })
    },
    resetForm() {
      this.$refs['loginForm'].resetFields();
    }
  }
}
</script>

<style scoped lang="less">

</style>
