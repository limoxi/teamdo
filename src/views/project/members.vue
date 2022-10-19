<template>
  <div class="aui-project-members">
    <member-card
        v-for="pu in project.users"
        :key="pu.id"
        :member="pu"
        @onDelete="onDeleteMember"
        @click="onSelectMember(pu)"
    />
    <Button v-if="isManager" icon="md-add" @click="onAddMember" class="aui-i-add-btn">添加新成员</Button>
  </div>
  <div class="aui-project-member-stats" v-if="selectedMemberId > 0">
    <p>总任务数：{{ memberTotalTaskCount }}</p>
    <p>已完成任务数：{{ memberFinishedTaskCount }}</p>
    <p>进行中任务数：{{ memberWorkingTaskCount }}</p>
    <p>已放弃任务数：{{ memberAbortTaskCount }}</p>
  </div>
</template>

<script setup>
import _ from 'lodash'
import MemberCard from './member_card';
import {computed, inject, onMounted, ref} from "vue";
import {Message, Modal} from 'view-ui-plus'
import {useModalStore, useUserStore} from '@/store'
import StatsService from '@/service/stats_service'

const userStore = useUserStore()
const modalStore = useModalStore()

const project = inject('project')

const isManager = computed(() => {
  return project.value.users.filter(member => member.id === userStore.uid && member.is_manager).length > 0
})

onMounted(() => {
  modalStore.$subscribe((_, state) => {
    const userSelectModal = state.userSelectModal
    if (userSelectModal.userSelected) {
      if (userSelectModal.selectedUserId > 0) {
        project.value.addUser(userSelectModal.selectedUserId).then(() => {
          Message.success('添加成员成功，正在刷新...');
        }).catch(err => {
          Message.error(err.errMsg);
        })
      }
    }
  })
})

const onAddMember = () => {
  modalStore.show('userSelectModal', {})
}

const onDeleteMember = (member) => {
  Modal.confirm({
    title: '移除项目成员',
    content: '<strong>确定要移除该项目成员么？</strong>',
    okText: '确认',
    cancelText: '再想想',
    onOk: () => {
      project.value.removeUser(member.id).then(() => {
        Message.success('操作成功');
      }).catch(err => {
        Message.error(err.errMsg);
      });
    }
  });
}

let selectedMemberId = ref(0)
let memberTotalTaskCount = ref(0)
let memberFinishedTaskCount = ref(0)
let memberWorkingTaskCount = ref(0)
let memberAbortTaskCount = ref(0)
const onSelectMember = (member) => {
  if (member.id === selectedMemberId.value) return
  resetStats()
  StatsService.statsForProjectUser(project.value.id, member.id).then(data => {
    if (_.isNil(data)) return
    data.forEach(row => {
      memberTotalTaskCount.value += row.count
      if (row.status === 3) {
        memberAbortTaskCount.value += row.count
      } else if (row.status === 2) {
        memberFinishedTaskCount.value += row.count
      } else {
        memberWorkingTaskCount.value += row.count
      }
    })
    selectedMemberId.value = member.id
  })
}

const resetStats = () => {
  memberTotalTaskCount.value = 0
  memberFinishedTaskCount.value = 0
  memberWorkingTaskCount.value = 0
  memberAbortTaskCount.value = 0
}

</script>

<style lang="less" scoped>
.aui-project-members {
  display: flex;
  flex-wrap: wrap;
  margin: 15px;
}

.aui-i-add-btn {
  margin: auto 5px;
}
</style>
