<template>
  <div class="aui-project-stats">
    <div class="aui-i-section aui-flex-row">
      <div class="aui-i-sc" id="sc3">
        <span>
          <Paragraph>
            <Text strong>总任务数</Text>
          </Paragraph>
          <CountUp :end="totalTaskCount" :duration="1" v-font="24"/>
        </span>
        <span style="display: flex; justify-content: space-between">
          <span>
          <Paragraph>
            <Text strong>已完成</Text>
          </Paragraph>
          <CountUp :end="finishedTaskCount" :duration="1" v-font="24"/>
        </span>
        <span>
          <Paragraph>
            <Text strong>进行中</Text>
          </Paragraph>
          <CountUp :end="workingTaskCount" :duration="1" v-font="24"/>
        </span>
        <span>
          <Paragraph>
            <Text strong>已放弃</Text>
          </Paragraph>
          <CountUp :end="abortTaskCount" :duration="1" v-font="24"/>
        </span>
        </span>
      </div>
      <v-chart class="aui-i-sc"
               :theme="theme"
               autoresize
               :option="pieOptions"
               :loading="loadingPie"></v-chart>
      <v-chart class="aui-i-sc"
               :theme="theme"
               autoresize
               :option="barOptions"
               :loading="loadingBar"></v-chart>
    </div>
    <div class="aui-i-section aui-i-trend">
      <DatePicker
          v-model="dateRange"
          separator=" ~ "
          type="daterange"
          :options="datePickerOps"
          placement="bottom-end"
          style="width: 200px"
          @on-change="onDatePickerChange"
      />
      <div class="aui-flex-row">
        <v-chart class="aui-i-sc"
                 :theme="theme"
                 autoresize
                 :option="lineOptions"
                 :loading="loadingLine"></v-chart>

        <v-chart class="aui-i-sc"
                 :theme="theme"
                 autoresize
                 :option="bugLineOptions"
                 :loading="loadingLine"></v-chart>
      </div>
    </div>
  </div>
</template>

<script setup>
import {computed, onMounted, ref} from "vue";
import VChart from 'vue-echarts';
import StatsService from "@/service/stats_service";
import {useConfigStore} from "@/store";
import {storeToRefs} from "pinia";
import moment from "moment";

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
    data: ['每日新增', '每日完成'],
    right: 0
  },
  xAxis: {
    type: 'category',
    data: []
  },
  yAxis: {
    type: 'value'
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
    data: ['每日新增', '每日完成'],
    right: 0
  },
  xAxis: {
    type: 'category',
    data: []
  },
  yAxis: {
    type: 'value'
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

const datePickerOps = computed(() => {
  return {
    shortcuts: [
      {
        text: '今日',
        value() {
          const end = new Date();
          const start = new Date();
          start.setTime(start.getTime());
          return [start, end];
        }
      },
      {
        text: '一周',
        value() {
          const end = new Date();
          const start = new Date();
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
          return [start, end];
        }
      },
      {
        text: '一月',
        value() {
          const end = new Date();
          const start = new Date();
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
          return [start, end];
        }
      },
      {
        text: '三月',
        value() {
          const end = new Date();
          const start = new Date();
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
          return [start, end];
        }
      }
    ]
  }
})

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
  updateSc4()
}

const loadDailyData = () => {
  StatsService.getDailyStatsForProject(projectId).then(data => {
    console.log(data)
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
    'stack': 'total',
    'data': status2typeCounts[0]
  }, {
    'name': '已完成',
    'type': 'bar',
    'label': {
      show: true
    },
    'stack': 'total',
    'data': status2typeCounts[1]
  }, {
    'name': '进行中',
    'type': 'bar',
    'label': {
      show: true
    },
    'stack': 'total',
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

  lineOptions.value.xAxis.data = dates
  lineOptions.value.series = [{
    name: '每日新增',
    type: 'line',
    data: newCounts
  }, {
    name: '每日完成',
    type: 'line',
    data: finishedCounts
  }]

  bugLineOptions.value.xAxis.data = dates
  bugLineOptions.value.series = [{
    name: '每日新增',
    type: 'line',
    data: bugNewCounts
  }, {
    name: '每日完成',
    type: 'line',
    data: bugFinishedCounts
  }]

  loadingLine.value = false
}

</script>

<style lang="less" scoped>
.aui-project-stats {
  padding: 15px;

  .aui-i-section {
    margin-bottom: 10px;
    border: 2px solid whitesmoke;
    border-radius: 2px;
    padding: 15px;
  }

  .aui-flex-row {
    display: flex;
    justify-content: space-around;
  }

  .aui-i-sc {
    width: 500px;
    height: 300px;
  }

  .aui-i-charts {
    display: flex;
    justify-content: space-between;
  }
}

</style>
