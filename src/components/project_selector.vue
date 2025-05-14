<template>
  <Select
      ref="selector"
      clearable
      :model-value="projectId"
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
import {Option} from "view-ui-plus";
import PinyinMatch from "pinyin-match";
import {inject, ref} from "vue";

const selector = ref(null)

const emit = defineEmits(['update:projectId', 'onSelected'])
const props = defineProps({
  projectId: {
    type: Number,
    default: 0
  }
})

const allProjects = inject('projects')
const validProjects = ref(allProjects.value)

const searchProject = (query) => {
  validProjects.value = allProjects.value.filter(project => {
    return !!(PinyinMatch.match(project.name, query)) || project.name === query
  })
}

const onSelectProject = selectedProjectId => {
  console.log(selectedProjectId, '-------------')
  emit('update:projectId', selectedProjectId.value)
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