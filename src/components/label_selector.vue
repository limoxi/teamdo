<template>
  <div class="label-selector">
    <Select 
      filterable
      allow-create
      v-model="selectedTag"
      @on-create="onCreate"
      @on-select="onSelect"
    >
      <Option v-for="(tag, index) in tags" :value="`${tag.name}:${tag.color}`" :key="tag.name" @mouseover="handleMouseover(index)">
        <Badge :color="tag.color" :text="tag.name" />

        <!-- <Button class="edit-tag-button" type="primary" v-if="hoverTagIndex === index" @click.stop="handleEdit" size="small">编辑</Button> -->
      </Option>
    </Select>
  </div>
</template>
<script setup>

import {onMounted, ref, inject} from "vue";
import TagService from "../service/tag_service";

let tags = ref([])
let selectedTag = ref({})
let hoverTagIndex = ref(-1)
const project = inject('project')
const emit = defineEmits(['onSelect', 'mouseover'])

const colors = ['#2b85e4', '#19be6b', '#ff9900', '#ed4014', '#17233d']

onMounted(() => {
  loadTags()
  console.log(tags)
})

const loadTags = () => {
  TagService.getTagsForProject(project.id).then(data => {
    tags.value = data
  })
}

// const onCreate = (newTagName) => {
//   if (newTagName === '') {
//     return
//   }
//   let existed = false
//   for (let tag of tags.value) {
//     if (tag.name === newTagName) {
//       selectedTag = tag
//       existed = true
//     }
//   }

//   if (!existed) {
//     selectedTag = {
//       'name': newTagName,
//       'color': colors[Math.floor(Math.random() * 5)]
//     }
//     emit('onSelect', selectedTag)
//   }
// }

const handleEdit = () => {
  console.log(111)
}

const handleMouseover = (index) => {
  hoverTagIndex.value = index
}

const onSelect = (newTag) => {
  const newTagName = newTag.label
  if (newTagName === '') {
    return
  }
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
  }

  emit('onSelect', selectedTag)
}

</script>

<style scoped>
.label-selector {
  height: 34px;
}
</style>
