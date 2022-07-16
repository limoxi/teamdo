<template>
  <div class="aui-kanban-action-bar">
    <Input placeholder="输入标题筛选" class="aui-i-name-filter" v-model="searchName" clearable @on-enter="handleSearch">
      <template #prefix>
        <Icon type="ios-search" />
      </template>
    </Input>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const emit = defineEmits(['search'])
const filters = ref({})
let searchName = ref('')

const handleSearch = (value) => {
  searchName = value
  filters.nameIn = value
  emit('search', filters)
}
</script>

<style scoped lang="less">
  .aui-kanban-action-bar {
    width: 100%;
    height: 35px;
    display: flex;
    justify-content: flex-end;
    padding-right: 40px;

    .aui-i-name-filter{
      width: auto;
      cursor: pointer;
      .ivu-input-prefix{
        transform: scale(1.5);
      }
    }
  }
</style>
