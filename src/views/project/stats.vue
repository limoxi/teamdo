<template>
  <div class="aui-project-stats">
    <div class="aui-i-top">
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
      <div class="aui-i-sc" id="sc2"></div>
      <div class="aui-i-sc" id="sc1"></div>
    </div>
  </div>
</template>

<script setup>
import {onMounted, onUnmounted, ref} from "vue";
import * as echarts from "echarts/core";
import StatsService from "@/service/stats_service";

const props = defineProps(['projectId'])
const projectId = parseInt(props.projectId)

let totalTaskCount = ref(0)
let finishedTaskCount = ref(0)
let workingTaskCount = ref(0)
let abortTaskCount = ref(0)

let sc1, sc2

onMounted(() => {
  initSc1()
  initSc2()
  loadData()
})

onUnmounted(() => {
  sc1 && sc1.dispose()
  sc2 && sc2.dispose()
})

const loadData = () => {
  StatsService.statsForProjectTask(projectId).then(data => {
    console.log(data)
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

const initSc1 = () => {
  sc1 = echarts.init(document.getElementById('sc1'))
  sc1.setOption({
    color: ['#c5c8ce', '#19be6b', '#2d8cf0'],
    legend: {
      icon: 'rect'
    },
    xAxis: {
      type: 'value'
    },
    yAxis: {
      type: 'category',
      data: ['需求', '优化', 'BUG']
    },
    series: []
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

  sc1.setOption({
    series: [{
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
  })
}

const initSc2 = () => {
  sc2 = echarts.init(document.getElementById('sc2'))
  sc2.setOption({
    legend: {
      top: '5%',
      left: 'center'
    },
    series: [{
      name: '',
      type: 'pie',
      radius: ['40%', '70%'],
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '18',
          fontWeight: 'bold',
          formatter: '{b}  {c}\n{d}%'
        }
      },
      data: []
    }]
  })
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
  sc2.setOption({
    series: [{
      data: [{
        value: type2count['REQ'],
        name: '需求'
      }, {
        value: type2count['OPT'],
        name: '优化'
      }, {
        value: type2count['BUG'],
        name: 'BUG'
      }]
    }]
  })
}

</script>

<style lang="less" scoped>
.aui-project-stats {
  padding: 15px;

  .aui-i-top {
    display: flex;
    justify-content: space-between;
  }

  .aui-i-sc {
    width: 300px;
    height: 300px;
  }
}

</style>
