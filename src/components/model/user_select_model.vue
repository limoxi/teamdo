<template>
  <Modal
      v-model="showModel"
      title="用户列表"
      width="520"
      @on-ok="onConfirmed"
  >
    <Select
        v-model="selectedId"
        filterable
        :remote-method="searchUser"
        :loading="searching">
      <Option v-for="(targetUser, index) in targetUsers" :value="targetUser.id" :key="index">{{targetUser.nickname}}</Option>
    </Select>
  </Modal>
</template>
<script>
import UserService from '@/service/user_service';
import {events, EventBus} from '@/service/event_bus'

export default {
  props: ['show', 'projectId'],
  data() {
    return {
      targetUsers: [],
      selectedId: 0,
      searching: false,
      listStyle: {
        width: '200px',
        height: '200px'
      },
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
    },
  },
  methods: {
    searchUser(nickname) {
      if (nickname === '') {
        return;
      }
      this.searching = true;
      UserService.searchUserByNickname(nickname).then(users =>{
        this.searching = false
        this.targetUsers = users;
      }).catch(err =>{
        this.$Message.error(err);
        this.searching = false
      })
    },
    onConfirmed() {
      EventBus.emit(events.USER_SELECTED, this.selectedId);
      this.selectedId = 0;
      this.targetUsers = [];
    }
  }
}
</script>

<style scoped lang="less">

</style>
