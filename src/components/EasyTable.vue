<template>
  <div class="aui-easy-table">
    <slot name="search"></slot>
    <ul>
      <li class="aui-i-header" v-if="columns.length || 0 > 0">
          <span v-for="(column, columnIndex) in columns" :key="columnIndex">
            <slot :column="column">{{ column }}</slot>
          </span>
      </li>
      <li v-for="(record, recordIndex) in records" :key="recordIndex">
        <slot name="row" :record="record" :index="recordIndex"></slot>
      </li>
    </ul>
    <Page v-if="showPage" v-model="curPage" @change="onPageChange"
          :total="totalCount" :page-size="pageSize" show-total/>
  </div>
</template>

<script setup>

import {onMounted, ref} from "vue";

const props = defineProps({
  showPage: {
    type: Boolean,
    default: true
  },
  pageSize: {
    type: Number,
    default: 1
  },
  loadingFn: {
    type: Function,
    default: () => {
    }
  },
  columns: {
    type: Array,
    default: []
  }
})

const curPage = ref(1)
const totalCount = ref(0)

const loading = ref(true)
const records = ref([])

onMounted(() => {
  refresh()
})

const refresh = () => {
  props.loadingFn({
    curPage: curPage.value,
    pageSize: props.pageSize
  }).then(resp => {
    alert(resp.records.length)
    records.value = resp.records
    totalCount.value = resp.pageInfo ? resp.pageInfo.total_count : resp.records.length
  })
}

const onPageChange = page => {
  curPage.value = page
  refresh()
}

defineExpose({
  refresh
})

</script>

<style scoped lang="less">

</style>