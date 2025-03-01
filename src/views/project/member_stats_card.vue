<template>
  <div class="aui-members-stats-card">
    <Card :bordered="false" class="aui-member-stats-card" v-for="member in members" :key="member.id" :style="{height: `${member.heightPercent}%`}">
      <div>
        <Avatar :src="member.avatar">{{ member.nickname[0] }}</Avatar>
        {{ member.nickname }} · {{ member.taskCount }}
      </div>

    </Card>
  </div>
</template>

<script setup>

import {ref, inject, onMounted} from "vue"
import StatsService from '@/business/stats_service'
import {Avatar} from "view-ui-plus";
import {useUserStore} from "@/store";

const props = defineProps(['lane'])
const totalTaskCount = ref(props.lane.tasks.length)
const project = inject('project')

const userStore = useUserStore()

const members = ref([])

onMounted(() => {
  loadMembersData()
})

const loadMembersData = () => {
  console.log(props.lane.tasks)
  StatsService.getStatsForProjectUsersInLane(project.value.id, props.lane.id).then(userId2taskCount => {
    const sortedUserIds = Object.keys(userId2taskCount).sort((a, b) => {
      return userId2taskCount[b] - userId2taskCount[a]
    })

    const realTaskCount = Object.values(userId2taskCount).reduce((total, count) => total + count)
    if (realTaskCount > totalTaskCount.value){
      totalTaskCount.value = realTaskCount
    }

    for (let uid of sortedUserIds) {
      uid = parseInt(uid)
      const taskCount = userId2taskCount[uid]
      const user = userStore.getUser(uid)
      const p = taskCount/totalTaskCount.value * 100
      members.value.push({
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        taskCount: taskCount,
        heightPercent: p
      })
    }

  })
}

const getWeightedColor = (colorSeries, memberTaskCount, totalCount) => {
  let hue = 240  // 色系
  switch (colorSeries) {
    case 'red':
      hue = 0
          break
    case 'blue':
      hue = 240
          break
    case 'green':
      hue = 147
          break
    case 'yellow':
      hue = 39
          break
  }
  // 默认配置
  let saturation = 60   // 饱和度
  const lightness = 50  // 亮度

  // 处理权重范围
  const safeMin = Math.min(minWeight, maxWeight);
  const safeMax = Math.max(minWeight, maxWeight);

  // 计算权重比例（0-1之间）
  let ratio = (weight - safeMin) / (safeMax - safeMin || 1); // 避免除以0
  ratio = Math.max(0, Math.min(1, ratio)); // 限制在0-1范围

  // 计算当前亮度（权重越大亮度越低）
  saturation = minLightness + (1 - ratio) * (maxLightness - minLightness);

  // 返回HSL颜色字符串
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

</script>

<style scoped lang="less">
.aui-members-stats-card{
  height: 100%;

  .aui-member-stats-card{
    display: flex;
    align-items: center;
    margin-bottom: 2px;
  }
}

</style>
