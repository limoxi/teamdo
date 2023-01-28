<template>
  <div class="label-selector">
    <Card v-show="mode === 'edit'" :bordered="false">
      <template #title>
        <Icon type="ios-arrow-back"/>
        编辑标签
      </template>

      <Input v-model="activeTagName"/>

      <RadioGroup v-model="activeTagColor">
        <Radio :label="color" v-for="color in colors">
          <span class="color-circle" :style="{ backgroundColor: color }"></span>
        </Radio>
      </RadioGroup>
    </Card>
    <Select
        v-show="mode === 'select'"
        filterable
        allow-create
        @on-select="onSelect"
        @mouseout="handleMouseover(-1)"
    >
      <Option v-for="(tag, index) in tags" :value="`${tag.name}:${tag.color}`" :key="tag.name"
              @mouseover="handleMouseover(index)">
        <Badge :color="tag.color" :text="tag.name"/>

        <div class="aui-icons">
          <!-- <Icon type="md-create" :size="16" v-show="hoverTagIndex === index" class="edit-tag" @click.stop="handleEdit(tag)"></Icon> -->
          <Icon type="md-checkmark" :size="17" v-show="currentTags.find(ctag => ctag.name === tag.name)"
                class="edit-tag"></Icon>
        </div>
      </Option>
    </Select>
  </div>
</template>
<script setup>

import {inject, onMounted, ref} from "vue";
import {colors} from '@/utils/constant'
import TagService from "@/business/tag_service";

const project = inject('project')
const props = defineProps({
  currentTags: Array,
  bizCode: String
})
const emit = defineEmits(['onSelect', 'mouseover', 'mouseout'])

let tags = ref([])
let selectedTag = ref({})
let hoverTagIndex = ref(-1)
let mode = ref('select')
let activeTag = ref({})
let activeTagName = ref('')
let activeTagColor = ref('')

onMounted(() => {
  loadTags()
})

const loadTags = () => {
  TagService.getTagsForProject(project.value.id, props.bizCode).then(data => {
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

const handleEdit = (tag) => {
  mode.value = 'edit'
  activeTag = tag
  activeTagName.value = activeTag.name
  activeTagColor.value = activeTag.color
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
  min-height: 34px;
}

.ivu-select-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.aui-icons {
  height: 18px;
}

.color-circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: inline-block;
}
</style>
