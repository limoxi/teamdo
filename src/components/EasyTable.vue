<template>
  <div class="aui-easy-table">
    <slot name="search"></slot>
    <div class="aui-i-table">
      <Row class="aui-i-header" v-if="columns.length || 0 > 0">
        <Col :style="column.width?{minWidth: column.width}: ''" :span="parseInt(24/columns.length)"
             v-for="(column, columnIndex) in columns"
             :key="columnIndex">
          <slot :column="column">{{ column.name }}</slot>
        </Col>
      </Row>
      <div v-for="(record, recordIndex) in records" :key="recordIndex">
        <slot name="row-expend" :record="record"></slot>
        <Row>
          <Col :style="column.width?{minWidth: column.width}: ''" :span="parseInt(24/columns.length)"
               v-for="(column, columnIndex) in columns" :key="columnIndex">
            <slot :name="column.slot" v-if="column.slot" :record="record"></slot>
            <p v-else>{{ record[column.key] }}</p>
          </Col>
        </Row>
      </div>
    </div>
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
.aui-easy-table {

  .aui-i-table {
    margin: 5px;

    .aui-i-header {

    }
  }
}

</style>