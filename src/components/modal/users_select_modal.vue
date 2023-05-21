<template>
  <Modal
      v-model="usersSelectModal.show"
      title="用户列表"
      width="400"
      @on-visible-change="onVisibleChange"
      @on-ok="onConfirmed"
  >
    <Space split>
      <Select
          ref="selector"
          clearable
          filterable
          :remote-method="searchUser"
          @on-query-change="onQueryChange"
          @on-select="onSelectUser"
      >
        <Option v-for="user in selectableUsers" :value="user.id" :key="user.id">
          <img class="aui-user-selector-avatar" :src="user.avatar || defaultAvatar" alt="avatar"/>
          {{ user.nickname }}
        </Option>
      </Select>
      <Space>
        <div v-if="selectedUsers.length > 0" v-for="user in selectedUsers" :key="user.id" class="aui-i-selected-user">
          <Icon class="aui-i-del-btn" type="ios-close-circle" @click="onDeleteUser(user.id)"/>
          <Avatar shape="square" :src="user.avatar || defaultAvatar"></Avatar>
        </div>
        <p v-else>未选择</p>
      </Space>
    </Space>

  </Modal>
</template>
<script setup>
import ProjectService from "@/business/project_service";
import UserService from '@/business/user_service';
import defaultAvatar from '@/assets/images/default-avatar.webp'
import {ref} from "vue";
import {Message, Option, Space} from "view-ui-plus";
import {useModalStore} from '@/store'
import {storeToRefs} from "pinia";
import PinyinMatch from "pinyin-match";

const name = 'assignorSelectModal'
const modalStore = useModalStore()
const {projectId, usersSelectModal} = storeToRefs(modalStore)

const selector = ref(null)
const emit = defineEmits(['update:show', 'onSelect'])
let users = ref([])
let selectableUsers = ref([])
let selectedUsers = ref([])

const onVisibleChange = async (isShow) => {
  if (!isShow) return
  if (projectId.value > 0) {
    await getProjectUsers(projectId.value)
  } else {
    await getAllUsers()
  }
  selectedUsers.value = usersSelectModal.value.selectedUserIds.map(uid => selectableUsers.value.find(u => u.id === uid))
}

const getProjectUsers = async (pid) => {
  return ProjectService.getProjectMembers(pid).then(members => {
    users.value = members
    selectableUsers.value = members
  }).catch(e => {
    Message.error(e.errMsg || '获取项目成员失败')
  })
}

const getAllUsers = async () => {
  return UserService.getUsers().then(userList => {
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
  if (query === '') {
    selectableUsers.value = users.value
  }
}

const onDeleteUser = deletedUserId => {
  const index = selectedUsers.value.findIndex(u =>u.id === deletedUserId)
  selectedUsers.value.splice(index, 1)
}

const onSelectUser = selectedUser => {
  if (selectedUsers.value.length >= 2) {
    Message.error('已达人数上限')
    return
  }

  if(selectedUsers.value.filter(user => user.id === selectedUser.value).length > 0) {
    Message.warning('请勿重复选择')
    return
  }

  selectedUsers.value.push(selectableUsers.value.find(u => u.id === selectedUser.value))
}

const onConfirmed = () => {
  const selectedUserIds = selectedUsers.value.map(user => user.id)
  emit('onSelect', selectedUserIds, usersSelectModal.value.action, {
    laneId: usersSelectModal.value.laneId,
    taskId: usersSelectModal.value.taskId
  })
}

</script>

<style scoped lang="less">
  .aui-i-selected-user{
    position: relative;
    .aui-i-del-btn{
      position: absolute;
      font-size: 16px;
      top: -8px;
      right: -8px;

      &:hover{
        cursor: pointer;
      }
    }
  }
</style>
