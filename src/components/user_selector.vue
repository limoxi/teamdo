<template>
  <Select
      ref="selector"
      clearable
      :multiple="multi"
      :filterable="true"
      :remote-method="searchUser"
      @on-query-change="onQueryChange"
      @on-select="onSelectUser"
      style="width: 150px"
  >
    <Option v-for="user in selectableUsers" :value="user.id" :key="user.id">
      <img class="aui-user-selector-avatar" :src="user.avatar || defaultAvatar" alt="avatar"/>
      {{ user.nickname }}
    </Option>
  </Select>
</template>

<script setup>
import {Message, Option} from "view-ui-plus";
import defaultAvatar from '@/assets/images/default-avatar.webp'
import PinyinMatch from "pinyin-match";
import {computed, onMounted, ref} from "vue";
import ProjectService from "@/business/project_service";
import UserService from '@/business/user_service';

const selector = ref(null)

const emit = defineEmits(['onSelected'])

const props = defineProps({
  projectId: {
    type: Number,
    default: 0
  },
  multi: {
    type: Boolean,
    default: false
  }
})

const selectableUsers = ref([])
const users = ref([])

onMounted(() => {
  if (props.projectId > 0) {
    ProjectService.getProjectMembers(props.projectId).then(members => {
      selectableUsers.value = members
      users.value = members
    }).catch(e => {
      Message.error(e.errMsg || '获取项目成员失败')
    })
  } else {
    UserService.getUsers().then(userList => {
      selectableUsers.value = userList
      users.value = userList
    }).catch(e => {
      Message.error(e.errMsg || '获取用户失败')
    })
  }
})

const searchUser = (query) => {
  selectableUsers.value = users.value.filter(user => {
    return !!(PinyinMatch.match(user.nickname, query)) || user.nickname === query
  })
}

const onSelectUser = selectedUserId => {
  emit('onSelected', users.value.find(u => u.id === selectedUserId.value))
  selector.value.setQuery(null)
}

const onQueryChange = query => {
  if (query === '') {
    selectableUsers.value = users.value
  }
}

</script>

<style scoped lang="less">

</style>