<template>
  <div class="aui-easy-table">
    <slot name="search"></slot>
    <div class="aui-i-table">
      <Row class="aui-i-header" v-if="columns.length || 0 > 0">
        <Col class="aui-i-header-col" :style="column.width?{minWidth: column.width}: ''"
             :span="parseInt(24/columns.length)"
             v-for="(column, columnIndex) in columns"
             :key="columnIndex">
          <slot :column="column">{{ column.name }}</slot>
        </Col>
      </Row>
      <div class="aui-i-row" v-for="(record, recordIndex) in records" :key="recordIndex">
        <slot name="row-expend" :record="record"></slot>
        <Row>
          <Col class="aui-i-row-col" :style="column.width?{minWidth: column.width}: ''"
               :span="parseInt(24/columns.length)"
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
      min-width: 100%;
      margin-bottom: 5px;
      border-radius: 2px;

      .aui-i-header-col {
        padding: 5px;
        border: 1px solid whitesmoke;
      }

      :last-child {
        flex-grow: 1;
        max-width: 100%;
      }
    }

    .aui-i-row {
      border: 1px solid whitesmoke;
      margin-bottom: 5px;

      .aui-i-row-col {
        border-right: 1px solid whitesmoke;
        border-top: 1px solid whitesmoke;
        padding: 5px;
      }

      :last-child {
        flex-grow: 1;
        max-width: 100%;
        border-right: none;
      }
    }
  }
}

</style>