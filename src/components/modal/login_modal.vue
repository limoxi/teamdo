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
<script setup>
import UserService from '@/service/user_service';
import {computed} from "vue";
import {useUserStore} from '@/store/user'
import {Message} from "view-ui-plus";
import {useRouter} from 'vue-router'

const router = useRouter()
const userStore = useUserStore()

const emit = defineEmits(['update:show'])
const props = defineProps(['show'])
let showModel = computed({
  get() {
    return props.show;
  },
  set(newValue) {
    emit('update:show', newValue);
  }
})

const handleSubmit = (valid, { phone, password }) => {
  if(!valid) {
    return
  }
  UserService.doLogin(phone, password).then(data => {
    userStore.updateLoginInfo(data)
    showModel.value = false;
    Message.success({
      content: '登陆成功, 正在跳转页面...',
      onClose: () => {
        router.replace({name: 'projects'});
      }
    })
  }).catch(err => {
    Message.error(err.errMsg);
  });
}

</script>

<style scoped lang="less">

</style>
