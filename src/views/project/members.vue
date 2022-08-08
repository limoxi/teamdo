<template>
  <div class="aui-project-members">
    <member-card
        v-for="pu in project.users"
        :key="pu.id"
        :member="pu"
        @onDelete="onDeleteMember"
    />
    <Button v-if="isManager" icon="md-add" @click="onAddMember" class="aui-i-add-btn">添加新成员</Button>
  </div>
</template>

<script setup>
import MemberCard from './member_card';
import {inject, onMounted, computed} from "vue";
import {Message, Modal} from 'view-ui-plus'
import {useUserStore, useModalStore} from '@/store'

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
