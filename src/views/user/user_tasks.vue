<template>
    <top-frame>
        <template #header>
            <Header/>
        </template>
        <template #content>
            <template v-if="loadingTasks">
                <Skeleton
                        loading
                        animated
                        :title="false"
                        :paragraph="{ rows: 5, width: ['100%', '100%', '80%', '80%', '20%'] }"
                />
            </template>
            <template v-else>
                <div class="aui-page-title">
                    <div v-if="userId === uid || !userId">我的任务</div>
                    <div v-else>
            <span>
              <Avatar :src="userId2avatar[targetUser.id]" class="aui-i-avatar"/>
              <b>{{ targetUser.nickname }}&nbsp;的任务</b>
            </span>
                    </div>
                </div>
                <draggable
                        class="aui-user-tasks"
                        v-model="tasks"
                        item-key="id"
                        :animation="200"
                        group="user_task"
                        :disabled="false"
                        ghostClass="ghost"
                        chosenClass="chosen"
                        handle=".aui-user-tasks > .aui-task"
                        @start="drag = true"
                        @end="drag = false"
                        @sort="onListChange"
                >
                    <template #item="{_, index}" :key="index">
                        <user-task-card
                                v-model:task="tasks[index]"
                                :key="index"
                                :userId2avatar="userId2avatar"
                        ></user-task-card>
                    </template>
                </draggable>
            </template>
        </template>
    </top-frame>
</template>

<script setup>
import TopFrame from '@/components/frame/top_frame';
import Header from '@/components/frame/header/header';
import {onMounted, ref} from "vue"
import Draggable from 'vuedraggable';
import {useModalStore, useUserStore} from '@/store'
import TaskService from '@/business/task_service';
import UserTaskCard from './user_task_card.vue'
import {Message} from "view-ui-plus";
import {storeToRefs} from "pinia";
import defaultAvatar from '@/assets/images/default-avatar.webp';
import UserService from "../../business/user_service";

const modalStore = useModalStore()
const userStore = useUserStore()
const {uid} = storeToRefs(userStore)

const props = defineProps(['userId'])

const targetUser = ref({
    id: props.userId || 0,
    nickname: '',
    avatar: defaultAvatar,
})
const tasks = ref([])
const userId2avatar = ref({})
const loadingTasks = ref(true)
const filters = ref({})

const targetPage = ref({
    curPage: 1,
    maxPage: 1,
    pageSize: 1000,
    totalCount: 0
})

onMounted(() => {
    loadUserTasks()
})

const onPageChange = page => {
    loadUserTasks()
}

const onPageSizeChange = pageSize => {
    targetPage.value.pageSize = pageSize
    loadUserTasks()
}

const loadUserTasks = async () => {
    TaskService.getUserTasks(
        {
            'status__in': ['0', '1'],
            ...filters.value
        },
        {
            'with_users': true,
            'with_tags': true,
            'with_project': true,
        },
        ['-assignor_display_index', '-importance', '-updated_at'],
        targetPage.value,
        props.userId || 0
    ).then(resp => {
        tasks.value = resp.tasks
        if (resp.tasks.length > 0) {
            resp.tasks[0].users.forEach(user => {
                if (user.is_assignor) {
                    targetUser.value.nickname = user.nickname
                    user.avatar && (targetUser.value.avatar = user.avatar)
                }
            })
        }
        targetPage.value.totalCount = resp.pageInfo.total_count
        targetPage.value.maxPage = resp.pageInfo.max_page
        loadingTasks.value = false

        fillUsersAvatar()
    })
}

const fillUsersAvatar = () => {
    const allUserIds = new Set()
    tasks.value.forEach(task => {
        task.users.forEach(user => {
            allUserIds.add(user.id)
        })
    })

    UserService.getUsers({
        'id__in': Array.from(allUserIds)
    }).then(users => {
        users.forEach(user => {
            userId2avatar.value[user.id] = user.avatar
        })
    })
}

const onListChange = (event) => {
    let taskId = event.item.getAttribute('taskId')
    const targetTasks = [...event.to.children]
    let beforeTaskId
    targetTasks.forEach((el, index) => {
        if (el.getAttribute('taskId') === taskId) {
            if (index < targetTasks.length - 1) {
                beforeTaskId = parseInt(targetTasks[index + 1].getAttribute('taskId'))
            }
        }
    })

    TaskService.resortUserTask(parseInt(taskId), beforeTaskId).then(() => {
        Message.success('操作成功')
    }).catch(err => {
        console.error(err)
        Message.error(err.errMsg || '操作失败')
    })
}

</script>

<style scoped lang="less">
.aui-page-title {
  font-size: 16px;
  margin: 5px 10px;

  .aui-i-avatar {
    margin-right: 5px;
  }
}

.aui-user-tasks {
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  align-content: flex-start;
  height: calc(100vh - 80px);
}
</style>
