<template>
  <Select filterable allow-create
      v-model="selectedTag"
      @on-create="onCreate"
      @on-select="onSelect"
  >
    <Option v-for="tag in tags" :value="`${tag.name}:${tag.color}`" :key="tag.name">
      <Badge :color="tag.color" :text="tag.name" />
    </Option>
  </Select>
</template>
<script setup>

import {onMounted, ref, inject} from "vue";
import TagService from "../service/tag_service";

let tags = ref([])
let selectedTag = ref({})
const project = inject('project')
const emit = defineEmits(['onSelect'])

const colors = ['#2b85e4', '#19be6b', '#ff9900', '#ed4014', '#17233d']

onMounted(() => {
  loadTags()
})

const loadTags = () => {
  TagService.getTagsForProject(project.id).then(data => {
    tags.value = data
  })
}

const onCreate = (newTagName) => {
  let existed = false
  for (let tag of tags.value) {
    if (tag.name === newTagName) {
      selectedTag = tag
      existed = true
    }
  }

  if (!existed) {
    selectedTag = {
      'name': newTagName,
      'color': colors[Math.floor(Math.random() * 5)]
    }
    emit('onSelect', selectedTag)
  }
}

const onSelect = (tag) => {
  selectedTag = tag
  emit('onSelect', selectedTag)
}

</script>

<style scoped>

</style>
