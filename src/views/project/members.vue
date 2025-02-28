<template>
  <div class="aui-members">
    <div class="aui-i-members">
      <List border size="large">
        <ListItem>
          <Button v-if="isManager" icon="md-add" @click="onAddMember" class="aui-i-add-btn">添加新成员</Button>
          <Button type='text' style='margin-right:0' @click="selectedMemberId = 0">成员任务一览 >>></Button>
        </ListItem>
        <ListItem
            v-for="pu in project.users"
            :key="pu.id"
            @click="onSelectMember(pu)"
            :class="selectedMemberId === pu.id? 'active-list-item' : ''"
        >
          <ListItemMeta :avatar="userStore.getUser(pu.id)?.avatar ?? defaultAvatar">
            <template #title>
              {{ pu.nickname }}
              <Icon v-if="pu.is_manager" type="ios-ribbon" class="aui-i-manager"/>
            </template>
          </ListItemMeta>
          <template #action>
            <li style="margin-top: 3px">
              <Button type="text" size="small" @click="onOpenTasks($event, pu)">查看任务</Button>
              <Button v-if="!pu.is_manager" type="text" size="small" shape="circle" icon="md-close"
                      @click="onDeleteMember(pu)"></Button>
            </li>
          </template>
        </ListItem>
      </List>
    </div>

    <div class="aui-i-members-stats" v-if="selectedMemberId === 0">
      <v-chart
          class="aui-i-chart"
          :theme="theme"
          autoresize
          :option="membersTaskOptions"
          :loading="loadingCharts"></v-chart>
    </div>
    <div class="aui-i-member-stats" v-if="selectedMemberId > 0">
      <div>
        <Row :gutter="12" class="aui-i-row">
          <Col span="6">
            <Card>
              <template #title>
                <Text strong>总任务数</Text>
              </template>
              <CountUp :end="memberTotalTaskCount" :duration="1" v-font="24"/>
            </Card>
          </Col>
          <Col span="6">
            <Card>
              <template #title>
                <Text strong>已完成</Text>
              </template>
              <CountUp :end="memberFinishedTaskCount" :duration="1" v-font="24"/>
            </Card>
          </Col>
          <Col span="6">
            <Card>
              <template #title>
                <Text strong>进行中</Text>
              </template>
              <CountUp :end="memberWorkingTaskCount" :duration="1" v-font="24"/>
            </Card>
          </Col>
          <Col span="6">
            <Card>
              <template #title>
                <Text strong>已放弃</Text>
              </template>
              <CountUp :end="memberAbortTaskCount" :duration="1" v-font="24"/>
            </Card>
          </Col>
        </Row>
        <Row class="aui-i-row">
          <UserActiveTrends ref="userActiveTrends" :date2count="date2userActiveCount"></UserActiveTrends>
        </Row>
      </div>
      <div>
        <div class="aui-i-bar">
          <Space>
            <a href="javascript:void(0)" @click="onSwitchDateRange('week')">周</a>
            <a href="javascript:void(0)" @click="onSwitchDateRange('month')">月</a>
            <a href="javascript:void(0)" @click="onSwitchDateRange('3month')">三月</a>
            <DatePicker
                v-model="dateRange"
                separator=" ~ "
                type="daterange"
                placement="bottom-end"
                style="width: 200px"
                @on-change="onDatePickerChange"
            />
          </Space>
        </div>
        <div class="aui-i-charts">
          <Row :gutter="24" class="aui-i-row">
            <Col span="12">
              <v-chart
                  class="aui-i-chart"
                  :theme="theme"
                  autoresize
                  :option="newTaskLineOptions"
                  :loading="loadingCharts"></v-chart>
            </Col>
            <Col span="12">
              <v-chart
                  class="aui-i-chart"
                  :theme="theme"
                  autoresize
                  :option="finishedTaskLineOptions"
                  :loading="loadingCharts"></v-chart>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import _ from 'lodash'
import VChart from 'vue-echarts';
import defaultAvatar from '@/assets/images/default-avatar.webp';
import {computed, inject, onMounted, ref} from "vue";
import {Button, ListItem, ListItemMeta, Message, Modal} from 'view-ui-plus'
import {useConfigStore, useModalStore, useUserStore} from '@/store'
import StatsService from '@/business/stats_service'
import UserActiveTrends from '@/components/user_active_trends'
import moment from "moment";
import {storeToRefs} from "pinia";
import {getStatusColor, taskStatus2Num, taskStatus2Text, taskType2Name} from "../../utils/constant";
import {useRouter} from 'vue-router'

const router = useRouter()

const userActiveTrends = ref(null)
const date2userActiveCount = ref({})
const sortMembersStatsAction = ref('-total')  // not_start, working, finished, abort, total

const configStore = useConfigStore()
const {theme} = storeToRefs(configStore)

const loadingCharts = ref(true)

const nowStr = moment().format('YYYY-MM-DD')
let dateRange = ref([
  moment().add(-1, 'w').format('YYYY-MM-DD'), nowStr])

const userStore = useUserStore()
const modalStore = useModalStore()

const project = inject('project')

const isManager = computed(() => {
  return project.value.users.filter(member => member.id === userStore.uid && member.is_manager).length > 0
})

const newTaskLineOptions = ref({
  title: {
    text: '每日新增趋势'
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
    text: '每日完成趋势'
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

const membersTaskOptions = ref({
  tooltip: {
    trigger: 'axis'
  },
  backgroundColor: 'transparent',
  darkMode: theme.value === 'dark',
  grid: {
    show: false, // 隐藏网格
    borderWidth: 0, // 去除边框
    backgroundColor: 'transparent'
  },
  legend: {
    type: 'plain',
    show: true
  },
  xAxis: {
    type: 'value',
    show: false,
    splitLine: {
      show: false // 隐藏 x 轴的分割线
    },
    areaStyle: {
      show: false
    },
  },
  yAxis: {
    type: 'category',
    data: [],
    splitLine: {
      show: false // 隐藏 y 轴的分割线
    },
    areaStyle: {
      show: false
    },
  },
  toolbox: {
    show: true,
    right: 0,
    feature: {
      saveAsImage: {}
    }
  },
  series: []
})

onMounted(() => {
  loadAllMembersData()
})

const sortUsers = (userId2data, sortBy) => {
  let sortAction = 'asc'
  sortBy = sortBy.replaceAll('+', '')
  let sps = sortBy.split('-')
  if(sps.length === 2){
    sortAction = 'desc'
    sortBy = sps[1]
  }

  // 定义排序值计算函数
  const getSortValue = (userData) => {
    if (sortBy === 'total') {
      // 计算总数量：所有状态值之和
      return Object.values(userData).reduce((sum, val) => sum + val, 0);
    } else {
      // 获取指定状态的值（不存在时返回0）
      const k = taskStatus2Num[sortBy]
      return userData[k] || 0;
    }
  };

  // 执行排序
  return Object.keys(userId2data).sort((a, b) => {
    const valueA = getSortValue(userId2data[a]);
    const valueB = getSortValue(userId2data[b]);

    // 主排序条件：按目标值降序
    if (valueB !== valueA) {
      if (sortAction === 'desc') {
        return valueA - valueB; // 降序排列
      } else {
        return valueB - valueA;
      }
    }
    return 1
  });
}

const loadAllMembersData = () => {
  if (selectedMemberId.value > 0) return

  loadingCharts.value = true
  StatsService.getStatsForProjectUsers(project.value.id).then(respData => {
    const userId2data = {}
    Object.keys(respData).forEach(k => {
      const v = respData[k]
      const vData = {}
      Object.keys(v).forEach(dk => {
        vData[parseInt(dk)] = v[dk]
      })
      userId2data[parseInt(k)] = vData
    })
    console.log(userId2data)

    const sortedUserIds = sortUsers(userId2data, sortMembersStatsAction.value)
    const taskStatus2counts = {
      0: [],
      1: [],
      2: [],
      3: []
    }
    for (let userId of sortedUserIds){
      userId = parseInt(userId)
      const userData = userId2data[userId]
      Object.keys(userData).forEach(statusNum => {
        taskStatus2counts[statusNum].push(userData[statusNum])
      })
    }

    const series = []
    for(const statusNum of [3, 2, 0, 1]){
      const statusText = taskStatus2Text(statusNum)
      series.push({
        data: taskStatus2counts[statusNum],
        type: 'bar',
        stack: 'stack',
        color: getStatusColor(statusNum),
        label: {
          show: false,
        },
        name: statusText
      })
    }

    membersTaskOptions.value['yAxis']['data'] = sortedUserIds.filter(uid => {
      return !!project.value.getUser(parseInt(uid))
    }).map(uid => {
      return project.value.getUser(parseInt(uid)).nickname
    })

    changeBorderRadius(series)
    membersTaskOptions.value['series'] = series

    loadingCharts.value = false
  })
}

const changeBorderRadius = (series) => {
  const stackInfo = {};
  for (let i = 0; i < series[0].data.length; ++i) {
    for (let j = 0; j < series.length; ++j) {
      const stackName = series[j].stack;
      if (!stackName) {
        continue;
      }
      if (!stackInfo[stackName]) {
        stackInfo[stackName] = {
          stackStart: [],
          stackEnd: []
        };
      }
      const info = stackInfo[stackName];
      const data = series[j].data[i];
      if (data && data !== '-') {
        if (info.stackStart[i] == null) {
          info.stackStart[i] = j;
        }
        info.stackEnd[i] = j;
      }
    }
  }
  for (let i = 0; i < series.length; ++i) {
    const data = series[i].data;
    const info = stackInfo[series[i].stack];
    for (let j = 0; j < series[i].data.length; ++j) {
      // const isStart = info.stackStart[j] === i;
      const isEnd = info.stackEnd[j] === i;
      const topBorder = isEnd ? 30 : 0;
      const bottomBorder = 0;
      data[j] = {
        value: data[j],
        itemStyle: {
          borderRadius: [bottomBorder, topBorder, topBorder, bottomBorder]
        }
      };
    }
  }
}

const onAddMember = () => {
  modalStore.show('userSelectModal', {
    action: 'addProjectMember'
  })
}

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

const onDatePickerChange = (v) => {
  loadDailyData()
}

const loadActiveData = () => {
  if (selectedMemberId.value <= 0) return
  const dr = userActiveTrends.value.getDateRange()
  StatsService.getDailyActiveStatsForProjectUser(project.value.id, selectedMemberId.value, dr).then(datas => {
    date2userActiveCount.value = {}
    for (let data of datas) {
      date2userActiveCount.value[data.date] = data['active_count']
    }
  })
}

const loadDailyData = () => {
  if (selectedMemberId.value <= 0) return
  if (!_.isString(dateRange[0])) {
    dateRange.value = dateRange.value.map(vv => moment(vv).format('YYYY-MM-DD'))
  }
  loadingCharts.value = true
  StatsService.getDailyStatsForProjectUser(project.value.id, selectedMemberId.value, dateRange.value).then(data => {
    const new2data = {}
    const finished2data = {}
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

    }

    const dr = moment.range(dateRange.value[0], dateRange.value[1])
    const dates = Array.from(dr.by('day')).map(date => date.format('YYYY-MM-DD'))

    const newCounts = []
    const finishedCounts = []
    for (const date of dates) {
      newCounts.push(new2data[date] || 0)
      finishedCounts.push(finished2data[date] || 0)
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

    loadingCharts.value = false
  })
}

const onDeleteMember = (member) => {
  Modal.confirm({
    title: `移除项目成员-${member.nickname}`,
    content: '<strong>确定要移除该项目成员么？</strong>',
    okText: '确认',
    cancelText: '再想想',
    onOk: () => {
      project.value.removeUser(member.id).then(() => {
        Message.success('操作成功');
      }).catch(err => {
        Message.error(err.errMsg);
      });
    }
  });
}

const onOpenTasks = (e, member) => {
  e.stopPropagation()
  router.push({
    name: 'userTasks',
    query: {
      userId: member.id
    }
  })
}

let selectedMemberId = ref(0)
let memberTotalTaskCount = ref(0)
let memberFinishedTaskCount = ref(0)
let memberWorkingTaskCount = ref(0)
let memberAbortTaskCount = ref(0)

const onSelectMember = (member) => {
  if (member.id === selectedMemberId.value) return

  resetStats()
  selectedMemberId.value = member.id
  loadActiveData()
  StatsService.getStatsForProjectUser(project.value.id, member.id).then(data => {
    if (_.isNil(data)) return
    data.forEach(row => {
      memberTotalTaskCount.value += row.count
      if (row.status === 3) {
        memberAbortTaskCount.value += row.count
      } else if (row.status === 2) {
        memberFinishedTaskCount.value += row.count
      } else {
        memberWorkingTaskCount.value += row.count
      }
    })
  })
  loadDailyData()
}

const resetStats = () => {
  memberTotalTaskCount.value = 0
  memberFinishedTaskCount.value = 0
  memberWorkingTaskCount.value = 0
  memberAbortTaskCount.value = 0

  newTaskLineOptions.value.xAxis.data = []
  newTaskLineOptions.value.legend.data = []
  newTaskLineOptions.value.series = []

  finishedTaskLineOptions.value.xAxis.data = []
  finishedTaskLineOptions.value.legend.data = []
  finishedTaskLineOptions.value.series = []
}

</script>

<style lang="less" scoped>
.aui-members {
  display: flex;
  margin: 15px 30px;

  .aui-i-members {
    height: calc(100vh - 80px);
    min-width: 20vw;
    overflow: scroll;
    margin-right: 15px;

    .aui-i-manager {
      font-size: 18px;
      color: indianred;
      vertical-align: sub;
    }

    .ivu-list-item-meta {
      align-items: flex-end;
    }
  }

  .aui-i-members-stats{
    min-width: 75vw;
    height: calc(100vh - 80px);
    overflow-y: scroll;
    overflow-x: hidden;

    .aui-i-chart {
      height: 100%;
    }
  }

  .aui-i-member-stats {
    min-width: 75vw;
    height: calc(100vh - 80px);
    overflow-y: scroll;
    overflow-x: hidden;

    .aui-i-bar {
      //border: 1px solid #dcdee2;
      //border-radius: 5px;
      //padding: 0 15px;
      //margin-bottom: 5px;
    }

    .aui-i-row {
      margin-bottom: 15px;
    }

    .aui-i-chart {
      height: 350px;
    }
  }
}

.aui-i-add-btn {
  margin: auto 5px;
}

.aui-i-del-member-btn {
  font-size: 18px;

  :hover {
    transform: scale(1.1);
  }
}
</style>
