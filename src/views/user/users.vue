<template>
  <top-frame>
    <template #header>
      <Header/>
    </template>
    <template #content>
      <template v-if="loadingUsers">
        <Skeleton
            loading
            animated
            :title="false"
            :paragraph="{ rows: 5, width: ['100%', '100%', '80%', '80%', '20%'] }"
        />
      </template>
      <template v-else>
        <div class="aui-users-page">
          <user-action-bar @search="onLocalSearch"></user-action-bar>
          <Grid border hover :col="5" size="large" class="aui-i-users">
            <GridItem
                v-for="user in users"
                :key="user.id"
            >
              <div>
                <Avatar size="large" :src="user.avatar || defaultAvatar"></Avatar>
                <b style="margin-left: 10px">{{ user.nickname }}</b>
                <!--<div class="aui-i-roles">
                  <Tag v-for="role in user.roles" :key="role">{{ role }}</Tag>
                </div>-->
              </div>
              <div>
                <Button type="text" size="small" @click="onOpenTasks($event, user)">查看任务</Button>
              </div>
            </GridItem>
          </Grid>
        </div>
      </template>
    </template>
  </top-frame>
</template>

<script setup>
import TopFrame from '@/components/frame/top_frame';
import Header from '@/components/frame/header/header';
import {onMounted, ref} from "vue";
import {Avatar, GridItem} from 'view-ui-plus'
import {useConfigStore, useModalStore, useUserStore} from '@/store'
import {storeToRefs} from "pinia";
import {useRouter} from 'vue-router'
import defaultAvatar from '@/assets/images/default-avatar.webp'
import UserService from "@/business/user_service"
import UserActionBar from "./user_action_bar.vue";
import PinyinMatch from "pinyin-match";

const router = useRouter()

const configStore = useConfigStore()
const {theme} = storeToRefs(configStore)

const userStore = useUserStore()
const modalStore = useModalStore()

const users = ref([])
let cachedUsers = []
const loadingUsers = ref(true)

onMounted(() => {
  loadUsers()
})

const loadUsers = () => {
  UserService.getUsers().then(data => {
    cachedUsers = data
    users.value = data
    loadingUsers.value = false
  })
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

const onLocalSearch = filters => {
  if (!!filters['nickname']) {
    const queryNickname = filters['nickname']
    users.value = cachedUsers.filter(user => {
      return !!(PinyinMatch.match(user.nickname, queryNickname)) || user.nickname === queryNickname
    })
  } else {
    users.value = cachedUsers
  }
}

</script>

<style lang="less">
.aui-users-page {
  .ivu-grid-item .ivu-grid-item-main {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
}
</style>

<style lang="less" scoped>
.aui-users-page {
  height: calc(100vh - 80px);
  width: 100vw;
  overflow: scroll;

  .aui-i-users {
    width: 100%;
    padding: 0 5px;
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
