<template>
  <div class="aui-user-active-trends">
    <div class="aui-i-blocks">
      <Tooltip v-for="(block, index) in blocks" :key="index" :content="block.date" placement="top" transfer>
        <span class="aui-i-title" v-if="block.axis>0 && index > 1">{{block.axis}}月</span>
        <span class="aui-i-block cl0"></span>
      </Tooltip>
    </div>
    <div class="aui-i-tips">
      <span class="aui-i-block cl0"></span>
      <span class="aui-i-block cl1"></span>
      <span class="aui-i-block cl2"></span>
      <span class="aui-i-block cl3"></span>
      <span class="aui-i-block cl4"></span>
    </div>
  </div>
</template>

<script setup>
import {Tooltip} from "view-ui-plus";
import {computed, onMounted, ref} from "vue";
import moment from "moment";
import {extendMoment} from "moment-range";

moment.locale('zh-cn');
extendMoment(moment)

const props = defineProps(['date2count'])

const today = moment()
const startDate = today.subtract(1, 'year').weekday(0)

const blocks = computed(() =>{

  const today1 = moment()
  let curDay = startDate
  const days = []
  const hasMonth = new Set()
  while (true) {
    if (curDay.diff(today1, 'days') > 0) {
      break
    }
    let curMonth = `${curDay.year()}-${curDay.month()}`
    const data = {
      'date': `${curDay.format('YYYY-MM-DD')} 周${getWeekday(curDay.weekday())}`,
      'counts': props.date2count[curDay.format('YYYY-MM-DD')] || 0,
    }
    if (!hasMonth.has(curMonth) && curDay.weekday() === 0) {
      data['axis'] = parseInt(curMonth.split('-')[1]) + 1
      hasMonth.add(curMonth)
    }
    days.push(data)

    curDay = curDay.add(1, 'days')
  }
  return days
})

const getWeekday = wd => {
  switch (wd) {
    case 0:
      return '一'
    case 1:
      return '二'
    case 2:
      return  '三'
    case 3:
      return  '四'
    case 4:
      return  '五'
    case 5:
      return  '六'
    case 6:
      return  '日'
  }
}

const getDateRange = () => {
  return [startDate.format('YYYY-MM-DD'), today.format('YYYY-MM-DD')]
}

defineExpose({
  getDateRange
})

</script>

<style lang="less">
  .aui-theme-light{
    .cl0{
      background: darkgrey;
    }
    .cl1{
      background: #9be9a8;
    }
    .cl2{
      background: #40c463;
    }
    .cl3{
      background: #30a14e;
    }
    .cl4{
      background: #216e39;
    }
  }
  .aui-theme-dark{
    .cl0{
      background: #161b22;
    }
    .cl1{
      background: #0e4429;
    }
    .cl2{
      background: #006d32;
    }
    .cl3{
      background: #26a641;
    }
    .cl4{
      background: #39d353;
    }
  }
</style>

<style scoped lang="less">
.aui-user-active-trends{
  position: relative;
  .aui-i-blocks{
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    height: 190px;
    padding: 20px;
    border: 1px solid #e8eaec;
    border-radius: 2px;
    width: 73vw;

    .aui-i-title{
      position: absolute;
      top: -15px;
      width: 30px;
    }
  }


  .aui-i-tips{
    position: absolute;
    bottom: 5px;
    right: 28px;
    display: flex;
    flex-wrap: wrap;
  }

  .aui-i-blocks .aui-i-block, .aui-i-tips .aui-i-block{
    display: inline-block;
    width: 11px;
    height: 11px;
    border-radius: 1px;
  }

  .aui-i-tips .aui-i-block{
    margin-left: 2px;
  }

}

</style>