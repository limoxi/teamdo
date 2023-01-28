<template>
  <div class="aui-project-stats">
    <Row :gutter="24" class="aui-i-row">
      <Col span="6">
        <Card>
          <template #title>
            <Text strong>总任务数</Text>
          </template>
          <CountUp :end="totalTaskCount" :duration="1" v-font="24"/>
        </Card>
      </Col>
      <Col span="6">
        <Card>
          <template #title>
            <Text strong>已完成</Text>
          </template>
          <CountUp :end="finishedTaskCount" :duration="1" v-font="24"/>
        </Card>
      </Col>
      <Col span="6">
        <Card>
          <template #title>
            <Text strong>进行中</Text>
          </template>
          <CountUp :end="workingTaskCount" :duration="1" v-font="24"/>
        </Card>
      </Col>
      <Col span="6">
        <Card>
          <template #title>
            <Text strong>已放弃</Text>
          </template>
          <CountUp :end="abortTaskCount" :duration="1" v-font="24"/>
        </Card>
      </Col>
    </Row>
    <Row :gutter="24" class="aui-i-row">
      <Col span="12">
        <v-chart
            class="aui-i-chart"
            :theme="theme"
            autoresize
            :option="pieOptions"
            :loading="loadingPie"></v-chart>
      </Col>
      <Col span="12">
        <v-chart
            class="aui-i-chart"
            :theme="theme"
            autoresize
            :option="barOptions"
            :loading="loadingBar"></v-chart>
      </Col>
    </Row>
    <Row>
      <Col span="24">
        <Card class="aui-i-daily">
          <template #title>趋势分析</template>
          <template #extra>
            <Space>
              <a href="javascript:void(0)" @click="onSwitchDateRange('week')">周</a>
              <a href="javascript:void(0)" @click="onSwitchDateRange('month')">月</a>
              <a href="javascript:void(0)" @click="onSwitchDateRange('3month')">三月</a>
              <DatePicker
                  v-model="dateRange"
                  separator=" ~ "
                  format="yyyy-MM-dd"
                  type="daterange"
                  placement="bottom-end"
                  style="width: 200px"
                  @on-change="onDatePickerChange"
              />
            </Space>
          </template>
          <Row :gutter="24" class="aui-i-row">
            <Col span="12">
              <v-chart
                  class="aui-i-chart"
                  :theme="theme"
                  autoresize
                  :option="lineOptions"
                  :loading="loadingLine"></v-chart>
            </Col>
            <Col span="12">
              <v-chart
                  class="aui-i-chart"
                  :theme="theme"
                  autoresize
                  :option="bugLineOptions"
                  :loading="loadingLine"></v-chart>
            </Col>
          </Row>
          <Row :gutter="24" class="aui-i-row">
            <Col span="12">
              <v-chart
                  class="aui-i-chart"
                  :theme="theme"
                  autoresize
                  :option="newTaskLineOptions"
                  :loading="loadingLine"></v-chart>
            </Col>
            <Col span="12">
              <v-chart
                  class="aui-i-chart"
                  :theme="theme"
                  autoresize
                  :option="finishedTaskLineOptions"
                  :loading="loadingLine"></v-chart>
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  </div>
</template>

<script setup>
import {onMounted, ref} from "vue";
import VChart from 'vue-echarts';
import StatsService from "@/business/stats_service";
import {useConfigStore} from "@/store";
import {storeToRefs} from "pinia";
import moment from "moment";
import {Card, Col, Space, Text} from "view-ui-plus";
import {taskType2Name} from "../../utils/constant";

const configStore = useConfigStore()
const {theme} = storeToRefs(configStore)

const loadingPie = ref(true)
const loadingBar = ref(true)
const loadingLine = ref(true)
const pieOptions = ref({
  color: ['#2b85e4', '#ff9900', '#ed4014'],
  label: {
    show: false
  },
  tooltip: {
    trigger: 'item',
    formatter: '{b} : {c} ({d}%)',
  },
  legend: {
    data: ['需求', '优化', 'BUG'],
  },
  series: [
    {
      type: 'pie',
      radius: '55%',
      data: [],
    },
  ],
})
const barOptions = ref({
  color: ['#e8eaec', '#19be6b', '#2d8cf0'],
  legend: {},
  xAxis: {
    type: 'category',
    data: ['需求', '优化', 'BUG']
  },
  yAxis: {
    type: 'value'
  },
  series: []
})
const lineOptions = ref({
  title: {
    text: '每日趋势'
  },
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: ['每日新增', '每日完成']
  },
  xAxis: {
    type: 'category',
    data: []
  },
  yAxis: {
    type: 'value'
  },
  toolbox: {
    show: true,
    feature: {
      saveAsImage: {}
    }
  },
  series: []
})
const bugLineOptions = ref({
  title: {
    text: '每日BUG趋势'
  },
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: ['每日新增', '每日完成']
  },
  xAxis: {
    type: 'category',
    data: []
  },
  yAxis: {
    type: 'value'
  },
  toolbox: {
    show: true,
    feature: {
      saveAsImage: {}
    }
  },
  series: []
})

const newTaskLineOptions = ref({
  title: {
    text: '每日任务类型新增趋势'
  },
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: []
  },
  xAxis: {
    type: 'category',
    data: []
  },
  yAxis: {
    type: 'value'
  },
  toolbox: {
    show: true,
    right: 0,
    feature: {
      magicType: {
        type: ["stack"]
      },
      saveAsImage: {}
    }
  },
  series: []
})
const finishedTaskLineOptions = ref({
  title: {
    text: '每日任务类型完成趋势'
  },
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: []
  },
  xAxis: {
    type: 'category',
    data: []
  },
  yAxis: {
    type: 'value'
  },
  toolbox: {
    show: true,
    right: 0,
    feature: {
      magicType: {
        type: ["stack"]
      },
      saveAsImage: {}
    }
  },
  series: []
})

const props = defineProps(['projectId'])
const projectId = parseInt(props.projectId)

let totalTaskCount = ref(0)
let finishedTaskCount = ref(0)
let workingTaskCount = ref(0)
let abortTaskCount = ref(0)

const nowStr = moment().format('YYYY-MM-DD')
let dateRange = ref([
  moment().add(-1, 'w').format('YYYY-MM-DD'), nowStr])

const onSwitchDateRange = desc => {
  const now = moment()
  const nowStr = now.format('YYYY-MM-DD')
  switch (desc) {
    case 'today':
      dateRange.value = [nowStr, nowStr]
      break
    case 'week':
      dateRange.value = [
        now.add(-7, 'days').format('YYYY-MM-DD'),
        nowStr];
      break
    case 'month':
      dateRange.value = [
        now.add(-30, 'days').format('YYYY-MM-DD'),
        nowStr];
      break
    case '3month':
      dateRange.value = [
        now.add(-30 * 3, 'days').format('YYYY-MM-DD'),
        nowStr];
      break
  }
  loadDailyData()
}

onMounted(() => {
  loadData()
  loadDailyData()
})

const loadData = () => {
  StatsService.getStatsForProjectTask(projectId).then(data => {
    data.forEach(row => {
      totalTaskCount.value += row.count
      if (row.status === 3) {
        abortTaskCount.value += row.count
      } else if (row.status === 2) {
        finishedTaskCount.value += row.count
      } else {
        workingTaskCount.value += row.count
      }
    })
    updateSc1(data)
    updateSc2(data)
  })
}

const onDatePickerChange = (v) => {
  dateRange.value = v.map(vv => moment(vv).format('YYYY-MM-DD'))
  loadDailyData()
}

const loadDailyData = () => {
  StatsService.getDailyStatsForProject(projectId, dateRange.value).then(data => {
    updateSc4(data)
  })
}

const updateSc1 = (data) => {
  const status2typeCounts = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ]
  data.map(row => {
    let statusIndex = 0
    if (row.status <= 1) {
      statusIndex = 2
    } else if (row.status === 2) {
      statusIndex = 1
    } else if (row.status === 3) {
      statusIndex = 0
    }

    let typeIndex = 0
    if (row.type === 'REQ') {
      typeIndex = 0
    } else if (row.type === 'OPT') {
      typeIndex = 1
    } else if (row.type === 'BUG') {
      typeIndex = 2
    }
    status2typeCounts[statusIndex][typeIndex] += row.count
  })

  barOptions.value.series = [{
    'name': '已放弃',
    'type': 'bar',
    'label': {
      show: true
    },
    'data': status2typeCounts[0]
  }, {
    'name': '已完成',
    'type': 'bar',
    'label': {
      show: true
    },
    'data': status2typeCounts[1]
  }, {
    'name': '进行中',
    'type': 'bar',
    'label': {
      show: true
    },
    'data': status2typeCounts[2]
  }]

  loadingBar.value = false
}

const updateSc2 = (data) => {
  const type2count = {
    'REQ': 0,
    'OPT': 0,
    'BUG': 0
  }
  data.forEach(row => {
    if (row.status < 3) {
      type2count[row.type] += row.count
    }
  })
  pieOptions.value.legend.data = ['需求', '优化', 'BUG']
  pieOptions.value.series[0].data = [{
    value: type2count['REQ'],
    name: '需求'
  }, {
    value: type2count['OPT'],
    name: '优化'
  }, {
    value: type2count['BUG'],
    name: 'BUG'
  }]
  loadingPie.value = false
}

const updateSc4 = (data) => {
  const new2data = {}
  const finished2data = {}
  const bugNew2data = {}
  const bugFinished2data = {}
  const type2new_data = {}
  const type2finished_data = {}
  for (const row of data || []) {
    if (new2data[row.date]) {
      new2data[row.date] += row.new_task_count
    } else {
      new2data[row.date] = row.new_task_count
    }

    if (finished2data[row.date]) {
      finished2data[row.date] += row.finished_task_count
    } else {
      finished2data[row.date] = row.finished_task_count
    }

    if (!type2new_data[row.task_type]) {
      type2new_data[row.task_type] = {}
    }
    if (type2new_data[row.task_type][row.date]) {
      type2new_data[row.task_type][row.date] += row.new_task_count
    } else {
      type2new_data[row.task_type][row.date] = row.new_task_count
    }

    if (!type2finished_data[row.task_type]) {
      type2finished_data[row.task_type] = {}
    }
    if (type2finished_data[row.task_type][row.date]) {
      type2finished_data[row.task_type][row.date] += row.finished_task_count
    } else {
      type2finished_data[row.task_type][row.date] = row.finished_task_count
    }

    if (row.task_type === 'BUG') {
      bugNew2data[row.date] = row.new_task_count
      bugFinished2data[row.date] = row.finished_task_count
    }
  }

  const dr = moment.range(dateRange.value[0], dateRange.value[1])
  const dates = Array.from(dr.by('day')).map(date => date.format('YYYY-MM-DD'))

  const newCounts = []
  const finishedCounts = []
  const bugNewCounts = []
  const bugFinishedCounts = []
  for (const date of dates) {
    newCounts.push(new2data[date] || 0)
    finishedCounts.push(finished2data[date] || 0)

    bugNewCounts.push(bugNew2data[date] || 0)
    bugFinishedCounts.push(bugFinished2data[date] || 0)
  }

  const sortedNewTaskTypes = Object.keys(type2new_data).sort()
  newTaskLineOptions.value.xAxis.data = dates
  newTaskLineOptions.value.legend.data = sortedNewTaskTypes.map(tt => taskType2Name[tt] || '未知')
  newTaskLineOptions.value.series = sortedNewTaskTypes.map(taskType => {
    const date2data = type2new_data[taskType] || {}
    const counts = []
    for (const date of dates) {
      counts.push(date2data[date] || 0)
    }
    return {
      name: taskType2Name[taskType] || '未知',
      type: 'line',
      smooth: true,
      data: counts
    }
  })

  const sortedFinishedTaskTypes = Object.keys(type2finished_data).sort()
  finishedTaskLineOptions.value.xAxis.data = dates
  finishedTaskLineOptions.value.legend.data = sortedFinishedTaskTypes.map(tt => taskType2Name[tt] || '未知')
  finishedTaskLineOptions.value.series = sortedFinishedTaskTypes.map(taskType => {
    const date2data = type2finished_data[taskType] || {}
    const counts = []
    for (const date of dates) {
      counts.push(date2data[date] || 0)
    }
    return {
      name: taskType2Name[taskType] || '未知',
      type: 'line',
      smooth: true,
      data: counts
    }
  })

  lineOptions.value.xAxis.data = dates
  lineOptions.value.series = [{
    name: '每日新增',
    type: 'line',
    smooth: true,
    data: newCounts
  }, {
    name: '每日完成',
    type: 'line',
    smooth: true,
    data: finishedCounts
  }]

  bugLineOptions.value.xAxis.data = dates
  bugLineOptions.value.series = [{
    name: '每日新增',
    type: 'line',
    smooth: true,
    markLine: {
      data: [{type: 'average', name: '平均'}]
    },
    data: bugNewCounts
  }, {
    name: '每日完成',
    type: 'line',
    smooth: true,
    markLine: {
      data: [{type: 'average', name: '平均'}]
    },
    data: bugFinishedCounts
  }]

  loadingLine.value = false
}

</script>

<style lang="less" scoped>
.aui-project-stats {
  padding: 15px;

  .aui-i-row {
    margin-bottom: 15px;
  }

  .aui-i-daily {
    width: 100%;
  }

  .aui-i-chart {
    height: 350px;
  }

}

</style>
