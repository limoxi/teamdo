<template>
  <Card class="aui-member-card">
    <Tooltip content="项目管理员" v-if="isManager" placement="right">
      <Icon type="ios-ribbon" class="aui-i-manager"/>
    </Tooltip>
    <Button
        type="text" icon="md-close" slot="extra"
        class="aui-i-extra-btn"
        v-if="showDeleteBtn"
        @click="onDelete"
    />
    <img :src="avatar" alt="avatar"/>
    <div class="aui-i-desc">
      <p>{{ member.nickname }}</p>
    </div>
  </Card>
</template>

<script setup>

import defaultAvatar from '@/assets/images/default-avatar.webp';
import helper from '@/utils/helper';
import {computed, inject} from "vue";

const project = inject('project')
const props = defineProps(['member'])
const emit = defineEmits(['onDelete'])
const avatar = computed(() => {
  return props.member.avatar || defaultAvatar
})
const isManager = computed(() => {
  return props.member.is_manager
})
const showDeleteBtn = computed(() => {
  return project.value.creator_id !== helper.storage.get('uid') && !isManager.value;
})

const onDelete = () => {
  emit('onDelete', props.member);
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

  .aui-i-extra-btn {
    font-size: 20px;
    position: absolute;
    top: 0;
    right: 0;
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
