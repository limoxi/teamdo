<template>
  <div class="aui-project-members">
    <member-card
        v-for="member in members"
        :key="member.id"
        :member="member"
        :project="project"
        @onDelete="onDeleteMember"
    />
    <Button v-if="isManager" icon="md-add" @click="onAddMember" class="aui-i-add-btn">添加新成员</Button>
  </div>
</template>

<script setup>
import ProjectService from '@/service/project_service';
import MemberCard from './member_card';
import {events, EventBus} from '@/service/event_bus'
import helper from '@/utils/helper';
import {ref, inject, onMounted} from "vue";
import {Message, Modal} from 'view-ui-plus'

const project = inject('project').value
const members = ref([])
const isManager = ref(false)
const currentUserId = helper.storage.get('uid')
const eventMode = 'addProjectMember'

onMounted(() => {
  EventBus.on(events.USER_SELECTED, (mode, _, __, selectedUserId) => {
    if (mode !== eventMode) return
    if (selectedUserId === currentUserId) {
      Message.warning('用户已是项目成员');
      return
    }
    if (selectedUserId === 0) {
      return
    }
    ProjectService.addMember(project.id, selectedUserId).then(() => {
      Message.success('添加成员成功，正在刷新...');
      getMembers();
    }).catch(err => {
      Message.error(err.errMsg);
    })
  }, eventMode);

  getMembers()
})

const getMembers = () => {
  ProjectService.getProjectMembers(project.id).then(data => {
    members.value = data;
    data.forEach(user => {
      if (user.id === currentUserId) {
        if (user.is_manager) {
          isManager.value = true
        }
      }
    })
  }).catch(err => {
    Message.error(err.errMsg);
  });
}

const onAddMember = () => {
  EventBus.emit(events.SELECTING_USER, eventMode);
}

const onDeleteMember = (member) => {
  Modal.confirm({
    title: '移除项目成员',
    content: '<strong>确定要移除该项目成员么？</strong>',
    okText: '确认',
    cancelText: '再想想',
    onOk: () => {
      ProjectService.deleteMember(project.id, member.id).then(() => {
        helper.removeFromArray(member, members.value, 'id');
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
