<template>
    <top-frame>
        <template #header>
            <Header/>
        </template>
        <template #content>
            <template v-if="loadingProjects">
                <Skeleton
                        loading
                        animated
                        :title="false"
                        :paragraph="{ rows: 5, width: ['100%', '80%', '60%', '40%', '20%'] }"
                />
            </template>
            <template v-else>
                <project-action-bar @search="onLocalSearch"></project-action-bar>
                <ul class="aui-projects" v-if="projects.length > 0">
                    <li v-for="project in projects" :key="project.id">
                        <project-card :project="project" @on-delete="getProjects"></project-card>
                    </li>
                </ul>
                <Result v-else type="warning" title="还没有任何项目">
                    <template #desc>
                        新建一个项目吧~
                    </template>
                    <template #actions>
                        <Button icon="md-add" @click="addProject" class="aui-icon-scale">添加项目</Button>
                    </template>
                </Result>
            </template>
        </template>
    </top-frame>
    <project-modal
            @on-submitted="getProjects"
    ></project-modal>
    <bot-modal
            @on-submitted="getProjects"
    ></bot-modal>
</template>

<script setup>
import TopFrame from '@/components/frame/top_frame';
import Header from '@/components/frame/header/header';
import ProjectModal from '@/components/modal/project_modal';
import BotModal from '@/components/modal/bot_modal';
import ProjectCard from './project_card';
import ProjectService from '@/business/project_service';
import {onMounted, ref} from "vue";
import {Message} from "view-ui-plus";
import {useModalStore} from "@/store"
import ProjectActionBar from './project_action_bar'
import PinyinMatch from "pinyin-match";

const modalStore = useModalStore()

onMounted(() => {
    getProjects()
})

let loadingProjects = ref(true)
let projects = ref([])
let cachedProjects = []

const addProject = () => {
    modalStore.show('projectModal')
}

const getProjects = () => {
    ProjectService.getProjects().then(data => {
        projects.value = data;
        cachedProjects = data
        loadingProjects.value = false
    }).catch(err => {
        Message.error(err.errMsg)
    });
}

const onLocalSearch = filters => {
    if (!!filters['name']) {
        const queryName = filters['name']
        projects.value = cachedProjects.filter(project => {
            return !!(PinyinMatch.match(project.name, queryName)) || project.name === queryName
        })
    } else {
        if (!!filters['force']) {
            getProjects()
        } else {
            projects.value = cachedProjects
        }
    }
}

</script>

<style lang="less" scoped>
.aui-projects {
  overflow-y: scroll;
  height: calc(100vh - 85px);

  li {
    list-style: none;
    margin: 15px;
  }
}

</style>
