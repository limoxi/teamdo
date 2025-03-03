<template>
  <div class="aui-members-stats-card">
    <div class="aui-i-busy-members">
      <Card :bordered="false" class="aui-i-member-card"
            v-for="member in busyMembers" :key="member.id"
            @click="onClickBusyMember(member.id)"
      >
        <div>
          <Avatar :src="member.avatar">{{ member.nickname[0] }}</Avatar>
          {{ member.nickname }} · <b>{{ member.taskCount }}</b>
        </div>
      </Card>
    </div>
    <div v-if="idleMembers.length > 0" class="aui-i-idle-members">
      <Card :bordered="false" class="aui-i-member-card" v-for="member in idleMembers" :key="member.id">
        <div>
          <Avatar :src="member.avatar">{{ member.nickname[0] }}</Avatar>
          {{ member.nickname }}
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup>

import {inject, onMounted, ref} from "vue"
import StatsService from '@/business/stats_service'
import {Avatar} from "view-ui-plus";
import {useUserStore} from "@/store";

const emit = defineEmits(['onSelectMember'])
const props = defineProps(['lane'])
const totalTaskCount = ref(props.lane.tasks.length)
const project = inject('project')

const userStore = useUserStore()

const busyMembers = ref([])
const idleMembers = ref([])

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
    if (realTaskCount > totalTaskCount.value) {
      totalTaskCount.value = realTaskCount
    }

    for (let uid of sortedUserIds) {
      uid = parseInt(uid)
      const taskCount = userId2taskCount[uid]
      const user = userStore.getUser(uid)
      busyMembers.value.push({
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        taskCount: taskCount,
      })
    }

    if (realTaskCount > 50) return
    setTimeout(() => {
      project.value.users.forEach(pu => {
        if (!sortedUserIds.includes(pu.id+'')) {
          idleMembers.value.push({
            id: pu.id,
            nickname: pu.nickname,
            avatar: pu.avatar,
            taskCount: 0,
          })
        }
      })
    }, 100)
  })
}

const onClickBusyMember = (memberId) => {
  emit('onSelectMember', memberId)
}

</script>

<style lang="less">
.aui-members-stats-card .aui-i-member-card .ivu-card-body{
  padding: 6px 4px !important;
}
</style>

<style scoped lang="less">
.aui-members-stats-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow-y: scroll;

  .aui-i-busy-members {
    margin-bottom: 5px;
  }

  .aui-i-idle-members {
    &::before {
      content: '==== 未出现的成员 ====';
      display: block;
      width: 100%;
      text-align: center;
      color: gray;
    }
  }

  .aui-i-busy-members, .aui-i-idle-members {
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
    justify-content: flex-start;

    .aui-i-member-card {
      min-width: 40%;
      max-width: 50%;
      flex: 1;
      display: inline-block;

      .ivu-card-body {
        padding: 4px !important;
      }
    }
  }
}

</style>
