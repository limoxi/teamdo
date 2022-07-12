<template>
  <div class="aui-kanban-action-bar">
    <Input placeholder="输入标题筛选" class="aui-i-name-filter" clearable size="small">
      <template #prefix>
        <Icon type="ios-search" />
      </template>
    </Input>

  </div>
</template>

<script setup>
import {ref} from 'vue'
const filters = ref([])
</script>

<style scoped lang="less">
  .aui-kanban-action-bar{
    width: 100%;
    height: 20px;
    display: flex;
    justify-content: center;
    margin-top: -10px;

    .aui-i-name-filter{
      width: auto;
      cursor: pointer;
      .ivu-input-prefix{
        transform: scale(1.5);
      }
    }
  }
</style>
