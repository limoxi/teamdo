<template>
  <div class="aui-users-bar">
    <div class="aui-i-left">
      <Button type="text" icon="md-add" @click="onInviteUser" class="aui-icon-scale">邀请用户</Button>
    </div>
    <div class="aui-i-right">
      <Icon type="md-refresh" class="aui-i-icon" @click="onFreshUsers"/>
      <Input
          placeholder="搜索用户"
          :border="false"
          style="width: 150px"
          class="aui-i-filter"
          v-model="filteredUser"
          clearable
          @on-change="handleSearch"
      >
        <template #prefix>
          <Icon type="ios-search"/>
        </template>
      </Input>
    </div>
  </div>
</template>

<script setup>
import {ref} from 'vue'
import {Icon, Message} from "view-ui-plus"

const filters = ref({})
const emit = defineEmits(['search'])
const filteredUser = ref('')

const handleSearch = (force = false) => {

  emit('search', {
    'nickname': filteredUser.value,
    'force': force
  })
}

const onInviteUser = () => {
  Message.info('尽请期待！')
}

let refreshing = false
const onFreshUsers = () => {
  if (refreshing) {
    Message.warning('请勿频繁刷新...')
    return
  }
  refreshing = true
  handleSearch(true)
  Message.success({
    content: '刷新列表...',
    duration: 5,
    onClose: () => {
      refreshing = false
    }
  })
}

</script>

<style lang="less" scoped>
.aui-users-bar {
  width: 100%;
  max-height: 32px;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  margin-top: 1px;
  padding: 0 5px;

  .aui-i-icon {
    margin-right: 10px;
    font-size: 16px;
    vertical-align: middle;
    cursor: pointer;

    &:hover {
      transform: scale(1.1);
    }
  }

  .aui-i-filter {
    width: 135px;
    margin-left: 10px;
  }

}
</style>
