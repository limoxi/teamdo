<template>
  <Select
      ref="selector"
      :model-value="selectedProjectId"
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
import {inject, onMounted, ref} from "vue";

const selector = ref(null)

const emit = defineEmits(['onSelect'])
const props = defineProps({
  projectId: {
    type: Number,
    default: 0
  }
})

const allProjects = inject('projects')
const validProjects = ref([])
const selectedProjectId = ref(props.projectId || 0)

onMounted(() => {
  validProjects.value = allProjects.value
})

const onSelectProject = target => {
  selectedProjectId.value = target.value
  emit('onSelect', target.value)
  selector.value.setQuery(null)
}

const onQueryChange = query => {
  validProjects.value = allProjects.value.filter(project => {
    return !!(PinyinMatch.match(project.name, query))
        || project.name === query
        || query === ''
  })
}

</script>

<style scoped lang="less">

</style>