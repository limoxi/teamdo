<template>
  <Modal
      v-model="userSelectModal.show"
      title="用户列表"
      width="300"
      @on-visible-change="onVisibleChange"
      @on-ok="onConfirmed"
  >
    <Select
        ref="selector"
        v-model="userSelectModal.selectedUserId"
        clearable
        filterable
        @on-query-change="searchUser"
    >
      <Option :value="0">无</Option>
      <Option v-for="user in users" :value="user.id" :key="user.id">
        <img class="aui-user-selector-avatar" :src="user.avatar || defaultAvatar" alt="avatar"/>
        {{ user.nickname }}
      </Option>
    </Select>
  </Modal>
</template>
<script setup>
import ProjectService from "@/business/project_service";
import UserService from '@/business/user_service';
import defaultAvatar from '@/assets/images/default-avatar.webp'
import {ref} from "vue";
import {Message, Option} from "view-ui-plus";
import {useModalStore} from '@/store'
import {storeToRefs} from "pinia";

const name = 'userSelectModal'
const modalStore = useModalStore()
const {projectId, userSelectModal} = storeToRefs(modalStore)

const selector = ref(null)
const emit = defineEmits(['update:show'])
let users = ref([])


const onVisibleChange = (isShow) => {
  if (!isShow) return
  if (projectId.value > 0) {
    getProjectUsers(projectId.value)
  } else {
    getAllUsers()
  }
}

const getProjectUsers = (pid) => {
  ProjectService.getProjectMembers(pid).then(members => {
    users.value = members
  }).catch(e => {
    Message.error(e.errMsg || '获取项目成员失败')
  })
}

const getAllUsers = () => {
  UserService.getAllUsers().then(userList => {
    users.value = userList
  }).catch(e => {
    Message.error(e.errMsg || '获取用户失败')
  })
}

const searchUser = (nickname) => {
  if (nickname === '') {
    return users.value;
  }
  return users.value.filter(user => user.nickname === nickname)
}

const onConfirmed = () => {
  userSelectModal.value.userSelected = true
}

</script>

<style scoped lang="less">

</style>
