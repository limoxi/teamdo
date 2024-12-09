<template>
  <Modal
      v-model="usersSelectModal.show"
      :title="usersSelectModal.title || '用户选择'"
      width="400"
      @on-visible-change="onVisibleChange"
      @on-ok="onConfirmed"
  >
    <Space split>
      <UserSelector :projectId="projectId" :multi="true" @on-selected="onSelectUser"></UserSelector>
      <Space style="flex-wrap: wrap">
        <div v-if="selectedUsers.length > 0" v-for="user in selectedUsers" :key="user.id" class="aui-i-selected-user">
          <span class="aui-i-selected-user-del">
              <Icon class="aui-i-btn" type="md-trash"
                    @click="onDeleteUser(user.id)"/>
            </span>
          <Avatar :src="user.avatar || defaultAvatar"></Avatar>
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
import {inject, ref} from "vue";
import {Icon, Message, Modal, Space} from "view-ui-plus";
import {useModalStore} from '@/store'
import {storeToRefs} from "pinia";

const name = 'assignorSelectModal'
const modalStore = useModalStore()
const {usersSelectModal} = storeToRefs(modalStore)

const projectId = inject('projectId')

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
  if (usersSelectModal.value.limitCount !== -1 && selectedUsers.value.length >= usersSelectModal.value.limitCount) {
    Message.error('已达人数上限')
    return
  }

  if (selectedUsers.value.filter(user => user.id === selectedUser.id).length > 0) {
    Message.warning('请勿重复选择')
    return
  }

  selectedUsers.value.push(selectedUser)
}

const onDeleteUser = deletedUserId => {
  const index = selectedUsers.value.findIndex(u => u.id === deletedUserId)
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
.aui-i-selected-user {
  position: relative;

  .aui-i-selected-user-del {
    display: none;
    position: absolute;
    top: 0;
    text-align: center;
    color: indianred;
    font-size: 18px;
    width: 32px;
    height: 32px;
    border-radius: 100px;
    background: rgba(0, 0, 0, 0.4);

    i {
      vertical-align: bottom;
    }
  }

  &:hover {
    .aui-i-selected-user-del {
      display: inline-block;
      z-index: 1;
    }
  }
}
</style>
