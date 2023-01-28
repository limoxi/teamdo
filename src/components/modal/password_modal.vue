<template>
  <Modal
      v-model="showModel"
      title="修改密码"
      :width="400"
  >
    <Form ref="form" :model="form" :rules="ruleValidate" :label-width="100">
      <FormItem label="旧密码" prop="oldPwd">
        <Input type="password" v-model="form.oldPwd"/>
      </FormItem>
      <FormItem label="新密码" prop="newPwd">
        <Input type="password" v-model="form.newPwd"/>
      </FormItem>
      <FormItem label="确认新密码" prop="newPwdConfirmed">
        <Input type="password" v-model="form.newPwdConfirmed"/>
      </FormItem>
    </Form>
    <template #footer>
      <Button @click="confirm">确定</Button>
    </template>
  </Modal>
</template>

<script>
import UserService from '@/business/user_service';

export default {
  props: ['show'],
  data() {
    return {
      form: {
        oldPwd: '',
        newPwd: '',
        newPwdConfirmed: ''
      },
      ruleValidate: {
        oldPwd: [
          {required: true, message: '请填写当前密码', trigger: 'blur'}
        ],
        newPwd: [
          {required: true, message: '新密码不能为空', trigger: 'blur'}
        ],
        newPwdConfirmed: [
          {required: true, message: '请确认新密码', trigger: 'blur'}
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
    confirm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.form.newPwd !== this.form.newPwdConfirmed) {
            this.$Message.error('新密码前后不一致！')
            return
          }
          UserService.updatePwd(this.form.oldPwd, this.form.newPwd).then(() => {
            this.showModel = false;
            this.resetForm();
            this.$Message.success('修改密码成功,下次登录生效');
          }).catch(err => {
            this.$Message.error(err.errMsg);
          });
        }
      })
    },
    cancel() {
      this.resetForm();
    },
    resetForm() {
      this.$refs['form'].resetFields();
    }
  }
}
</script>

<style scoped lang="less">

</style>
