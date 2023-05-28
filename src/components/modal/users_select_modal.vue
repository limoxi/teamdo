<template>
  <Modal
      v-model="usersSelectModal.show"
      title="用户列表"
      width="400"
      @on-visible-change="onVisibleChange"
      @on-ok="onConfirmed"
  >
    <Space split>
      <UserSelector :projectId="projectId" @on-selected="onSelectUser"></UserSelector>
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

import defaultAvatar from '@/assets/images/default-avatar.webp'
import UserSelector from '@/components/user_selector'
import UserService from '@/business/user_service';
import {ref} from "vue";
import {Message, Space} from "view-ui-plus";
import {useModalStore} from '@/store'
import {storeToRefs} from "pinia";

const name = 'assignorSelectModal'
const modalStore = useModalStore()
const {projectId, usersSelectModal} = storeToRefs(modalStore)

const selector = ref(null)
const emit = defineEmits(['update:show', 'onSelect'])
let users = ref([])
let selectedUsers = ref([])

const onVisibleChange = async (isShow) => {
  if (!isShow) return
  UserService.getUsers({
    'id__in': usersSelectModal.value.selectedUserIds
  }).then(userList => {
    selectedUsers.value = userList
  }).catch(e => {
    Message.error(e.errMsg || '获取用户失败')
  })
}

const onSelectUser = selectedUser => {
  if (selectedUsers.value.length >= 2) {
    Message.error('已达人数上限')
    return
  }

  if(selectedUsers.value.filter(user => user.id === selectedUser.id).length > 0) {
    Message.warning('请勿重复选择')
    return
  }

  selectedUsers.value.push(selectedUser)
}

const onDeleteUser = deletedUserId => {
  const index = selectedUsers.value.findIndex(u =>u.id === deletedUserId)
  selectedUsers.value.splice(index, 1)
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
