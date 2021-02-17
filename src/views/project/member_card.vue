<template>
  <Card class="aui-member-card">
    <Tooltip content="项目管理员" v-show="isManager" placement="right">
      <Icon type="ios-ribbon" class="aui-i-manager"/>
    </Tooltip>
    <Button
        type="text" icon="md-close" slot="extra"
        class="aui-i-extra-btn"
        v-show="showDeleteBtn"
        @click="onDelete"
    />
    <img :src="avatar" alt="avatar"/>
    <div class="aui-i-desc">
      <p>{{ member.user.nickname }}</p>
      <p>{{ member.role && member.role.name }}</p>
    </div>
  </Card>
</template>

<script>

import defaultAvatar from '@/images/default-avatar.webp';
import helper from '@/utils/helper';

export default {
  props: ['member', 'project'],
  data() {
    return {}
  },
  computed: {
    avatar() {
      return this.member.user.avatar || defaultAvatar;
    },
    isManager() {
      if (!this.project) {
        return false;
      }
      return this.member.is_manager;
    },
    showDeleteBtn() {
      if (!this.project) {
        return false;
      }
      return this.project.creator_id === helper.storage.get('uid') && !this.isManager;
    }
  },
  methods: {
    onDelete() {
      this.$emit('deleteMember', this.member);
    }
  }
}
</script>

<style lang="less">
.aui-member-card {
  width: 150px;
  margin-left: 5px;
  text-align: center;

  img {
    width: 80px;
    border-radius: 50px;
  }

  .aui-i-hr {
    border-bottom: 1px dashed grey;
  }

  .ivu-card-extra {
    top: 0;
    right: 0;

    .aui-i-extra-btn {
      font-size: 20px;
    }
  }

  .ivu-tooltip {
    font-size: 22px;
    position: absolute;
    top: 0;
    left: 5px;
    color: indianred;
    cursor: none;
  }
}
</style>
