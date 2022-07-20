<template>
  <Modal
      v-model="showModel"
      @on-visible-change="onVisibleChange"
      title="用户列表"
      width="300"
      @on-ok="onConfirmed"
  >
    <Select
        v-model="selectedUserId"
        clearable
        filterable
        :remote-method="searchUser"
    >
      <Option :value="0">无</Option>
      <Option v-for="user in users" :value="user.id" :key="user.id">
        <img class="aui-user-selector-avatar" :src="user.avatar || defaultAvatar" alt="avatar"/>
        {{user.nickname}}
      </Option>
    </Select>
  </Modal>
</template>
<script setup>
import ProjectService from "@/service/project_service";
import UserService from '@/service/user_service';
import defaultAvatar from '@/images/default-avatar.webp'
import {events, EventBus} from '@/service/event_bus'
import {ref, computed} from "vue";
import {Message, Option} from "view-ui-plus";

const props = defineProps(['show', 'projectId', 'taskId'])
const emit = defineEmits(['update:show'])
let selectedUserId = ref(0)
let users = ref([])

let showModel = computed({
  get() {
    return props.show;
  },
  set(newValue) {
    emit('update:show', newValue);
  }
})

const onVisibleChange = (isShow) => {
  if (!isShow) return
  if(props.projectId > 0) {
    getProjectUsers(props.projectId)
  } else {
    getAllUsers()
  }
}

const getProjectUsers = (projectId) => {
  ProjectService.getProjectMembers(projectId).then(members => {
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
    return;
  }
  return users.value.filter(user => user.nickname === nickname)
}

const onConfirmed = () => {
  EventBus.emit(events.USER_SELECTED, props.projectId, props.taskId, selectedUserId.value)
  selectedUserId.value = 0
}

</script>

<style scoped lang="less">

</style>
