<template>
    <Modal
            v-model="projectSelectModal.show"
            title="项目列表"
            width="300"
            @on-visible-change="onVisibleChange"
            @on-ok="onConfirmed"
    >
        <Select
                ref="selector"
                v-model="projectSelectModal.selectedProjectId"
                clearable
                filterable
                :remote-method="searchProject"
                @on-query-change="onQueryChange"
        >
            <Option v-for="project in selectableProjects" :value="project.id" :key="project.id">
                {{ project.name }}
            </Option>
        </Select>
    </Modal>
</template>
<script setup>
import {ref} from "vue";
import {Message, Option} from "view-ui-plus";
import {useModalStore} from '@/store'
import {storeToRefs} from "pinia";
import PinyinMatch from "pinyin-match";
import ProjectService from "../../business/project_service";

const name = 'projectSelectModal'
const modalStore = useModalStore()
const {projectSelectModal} = storeToRefs(modalStore)

const selector = ref(null)
const emit = defineEmits(['update:show', 'onSelect'])
let projects = ref([])
let selectableProjects = ref([])

const onVisibleChange = (isShow) => {
    if (!isShow) return
    getProjects()
}

const getProjects = () => {
    ProjectService.getLintProjects().then(projectList => {
        projects.value = projectList
        selectableProjects.value = projectList
    }).catch(e => {
        Message.error(e.errMsg || '获取项目列表失败')
    })
}

const searchProject = (query) => {
    selectableProjects.value = projects.value.filter(project => {
        return !!(PinyinMatch.match(project.name, query)) || project.name === query
    })
}

const onQueryChange = query => {
    if (query === '') {
        selectableProjects.value = projects.value
    }
}

const onConfirmed = () => {
    emit('onSelect', projectSelectModal.value.selectedProjectId, projectSelectModal.value.action)
}

</script>

<style scoped lang="less">

</style>
