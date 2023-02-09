<style scoped lang="less">
.aui-uploader-wrapper {
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
      <Mobile v-if="!isUpdateMode" name="username" :value="userForm.username" placeholder="请输入手机号"/>
      <UserName name="nickname" :value="userForm.nickname" placeholder="请输入姓名"/>
      <Password v-if="!isUpdateMode" name="password" placeholder="请输入密码"/>
      <Submit>{{ btnText }}</Submit>
    </Login>
  </Modal>
</template>
<script setup>
import Uploader from '@/components/uploader';
import UserService from '@/business/user_service';
import {computed, onBeforeUnmount, ref, watch} from "vue";
import {Message} from "view-ui-plus";
import {useUserStore} from '@/store'

const userStore = useUserStore()

const props = defineProps(['show', 'mode', 'user'])
const emit = defineEmits(['update:show', 'update:registered'])
let userForm = ref({
  username: '',
  nickname: '',
  avatar: ''
})

const cancelWatch = watch(props, (newV, oldV) => {
  if (newV.user) {
    userForm.value.nickname = newV.user.nickname
    userForm.value.avatar = newV.user.avatar
  }
})
onBeforeUnmount(() => {
  cancelWatch()
})

const title = computed(() => isRegisterMode.value ? '注册' : '编辑')
const isRegisterMode = computed(() => props.mode === 'register')
const isUpdateMode = computed(() => props.mode === 'update')
const btnText = computed(() => isRegisterMode.value ? '注册' : '提交')
let showModel = computed({
  get() {
    return props.show;
  },
  set(newValue) {
    emit('update:show', newValue);
  }
})

const handleSubmit = (valid, {username, nickname, password}) => {
  if (valid) {
    if (isRegisterMode.value) {
      UserService.doRegister({
        username: username,
        password: password,
        nickname: nickname,
      }).then(() => {
        Message.success('注册成功,可以登录了~');
        emit('update:registered', true);
        showModel.value = false;
      }).catch(err => {
        Message.error(err.errMsg);
      });
    }

    if (isUpdateMode.value) {
      const updatedData = {
        avatar: userForm.value.avatar,
        nickname: nickname,
      }
      UserService.updateUser(updatedData).then(() => {
        userStore.updateProfile(nickname, userForm.value.avatar)
        showModel.value = false;
        Message.success('修改信息成功~');
      }).catch(err => {
        Message.error(err.errMsg);
      });
    }
  }
}

</script>
