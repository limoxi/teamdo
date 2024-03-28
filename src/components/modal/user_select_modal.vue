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
        @on-query-change="onQueryChange"
    >
      <Option :value="0" :key="0">无</Option>
      <Option v-for="user in selectableUsers" :value="user.id" :key="user.id">
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
import PinyinMatch from "pinyin-match";

const name = 'userSelectModal'
const modalStore = useModalStore()
const {userSelectModal} = storeToRefs(modalStore)
const props = defineProps(['projectId'])

const selector = ref(null)
const emit = defineEmits(['update:show', 'onSelect'])
let users = ref([])
let selectableUsers = ref([])

const onVisibleChange = (isShow) => {
  if (!isShow) return
  if (props.projectId > 0) {
    getProjectUsers(props.projectId)
  } else {
    getAllUsers()
  }
}

const getProjectUsers = (pid) => {
  ProjectService.getProjectMembers(pid).then(members => {
    users.value = members
    selectableUsers.value = members
  }).catch(e => {
    Message.error(e.errMsg || '获取项目成员失败')
  })
}

const getAllUsers = () => {
  UserService.getUsers({
    'is_deleted': false
  }).then(userList => {
    users.value = userList
    selectableUsers.value = userList
  }).catch(e => {
    Message.error(e.errMsg || '获取用户失败')
  })
}

const searchUser = (query) => {
  selectableUsers.value = users.value.filter(user => {
    return !!(PinyinMatch.match(user.nickname, query)) || user.nickname === query
  })
}

const onQueryChange = query => {
  selectableUsers.value = users.value.filter(user => {
    return !!(PinyinMatch.match(user.nickname, query))
        || user.nickname === query
        || query === ''
  })
}

const onConfirmed = () => {
  emit('onSelect', userSelectModal.value.selectedUserId, userSelectModal.value.action, {
    laneId: userSelectModal.value.laneId,
    taskId: userSelectModal.value.taskId
  })
}

</script>

<style scoped lang="less">

</style>
