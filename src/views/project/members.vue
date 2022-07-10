<template>
  <div class="aui-project-members">
    <member-card
        v-for="member in members"
        :key="member.id"
        :member="member"
        :project="project"
        @deleteMember="onDeleteMember"
    />
    <Button v-if="isManager" icon="md-add" @click="onAddMember" class="aui-i-add-btn">添加新成员</Button>
  </div>
</template>

<script setup>
import ProjectService from '@/service/project_service';
import MemberCard from './member_card';
import defaultAvatar from '@/images/default-.webp';
import {events, EventBus} from '@/service/event_bus'
import helper from '@/utils/helper';
import {ref, inject, onMounted} from "vue";
import {Message} from 'view-ui-plus'

const project = inject('project')
const members = ref([])
const isManager = ref(false)
const currentUserId = helper.storage.get('uid')

onMounted(() => {
  EventBus.on(events.USER_SELECTED, (selectedUserId) => {
    if (selectedUserId === currentUserId) {
      Message.warning('用户已是项目成员');
      return
    }
    ProjectService.addMember(project.id, selectedUserId).then(() => {
      Message.success('添加成员成功，正在刷新...');
      this.getMembers();
    }).catch(err => {
      Message.error(err.errMsg);
    })
  });

  getMembers()
})

const getMembers = () => {
  ProjectService.getProjectMembers(project.id).then(data => {
    members.value = data;
    data.forEach(member => {
      if (member.user.id === currentUserId) {
        if (member.is_manager) {
          isManager.value = true
        }
      }
    })
  }).catch(err => {
    Message.error(err.errMsg);
  });
}

const onAddMember = () => {
  EventBus.emit(events.SELECTING_USER);
}

const onDeleteMember = (member) => {
  this.$Modal.confirm({
    title: '移除项目成员',
    content: '<strong>确定要移除该项目成员么？</strong>',
    okText: '确认',
    cancelText: '再想想',
    onOk: () => {
      ProjectService.deleteMember(project.id, member.user.id).then(() => {
        helper.removeFromArray(member, members);
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
