<template>
  <div class="aui-kanban-action-bar">
    <Input placeholder="输入任务标题筛选" class="aui-i-name-filter" v-model="taskName" clearable @on-enter="handleSearch" @on-clear="handleSearch">
      <template #prefix>
        <Icon type="ios-search" />
      </template>
    </Input>

    <Select 
      filterable
      clearable
      v-model="selectedMember"
      placeholder="按执行人筛选"
      @on-change="onSelect"
      class="aui-i-member-filter"
    >
      <Option v-for="(member, index) in members" :value="member.id" :key="member.id">
        <img class="member-avatar" :src="member.avatar || defaultAvatar" alt="avatar"/> {{ member.nickname }}
      </Option>
    </Select>
  </div>
</template>

<script setup>
import ProjectService from '@/service/project_service';
import { ref, onMounted, inject } from 'vue'
import defaultAvatar from '@/images/default-avatar.webp';

const emit = defineEmits(['search'])
const members = ref([])
const taskName = ref('')
const selectedMember = ref(0)
const project = inject('project')

onMounted(() => {
  getMembers()
})

const onSelect = () => {
  console.log(selectedMember.value)
  emit('search', { taskName: taskName.value, memberId: selectedMember.value })
}

const getMembers = () => {
  ProjectService.getProjectMembers(project.id).then(data => {
    members.value = data;
  }).catch(err => {
    Message.error(err.errMsg);
  });
}

const handleSearch = () => {
  emit('search', { taskName: taskName.value, memberId: selectedMember.value })
}
</script>

<style lang="less">
.aui-kanban-action-bar {
  width: 100%;
  height: 35px;
  display: flex;
  justify-content: flex-end;
  padding-right: 40px;

  .aui-i-name-filter{
    width: 180px;
    cursor: pointer;
    margin-right: 20px;
    .ivu-input-prefix{
      transform: scale(1.5);
    }
  }

  .aui-i-member-filter {
    width: 180px;
    .ivu-select-input {
      height: 30px;
      border-radius: 4px;
      color: #515a6e;
      background-color: #fff;
    }
    .ivu-select-item {
      display: flex;
      align-items: center;
    }
  }

  .member-avatar {
    width: 25px;
    height: 25px;
    border-radius: 50%;
    display: block;
    margin-right: 5px;
  }
}
</style>
