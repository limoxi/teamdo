<template>
  <Select
      ref="selector"
      clearable
      :filterable="true"
      :remote-method="searchProject"
      @on-query-change="onQueryChange"
      @on-select="onSelectProject"
      style="width: 150px"
  >
    <Option v-for="project in validProjects" :value="project.id" :key="project.id">
      {{ project.name }}
    </Option>
  </Select>
</template>

<script setup>
import {Message, Option} from "view-ui-plus";
import PinyinMatch from "pinyin-match";
import {onMounted, ref} from "vue";
import ProjectService from "@/business/project_service";

const selector = ref(null)

const emit = defineEmits(['onSelected'])
const props = defineProps({
  projectId: {
    type: Number,
    default: 0
  }
})

const allProjects = ref([])
const validProjects = ref([])

onMounted(() => {
  getProjects()
})

const getProjects = () => {
  ProjectService.getLintProjects().then(data => {
    allProjects.value = data
    validProjects.value = data
  }).catch(err => {
    Message.error(err.errMsg)
  })
}

const searchProject = (query) => {
  validProjects.value = allProjects.value.filter(project => {
    return !!(PinyinMatch.match(project.name, query)) || project.name === query
  })
}

const onSelectProject = selectedProjectId => {
  console.log(selectedProjectId, '-------------')
  emit('onSelected', selectedProjectId.value)
  selector.value.setQuery(null)
}

const onQueryChange = query => {
  if (query === '') {
    validProjects.value = allProjects.value
  }
}

</script>

<style scoped lang="less">

</style>