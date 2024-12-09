<template>
  <Modal
      v-model="tagsSelectModal.show"
      title="标签选择"
      width="800"
      @on-visible-change="onVisibleChange"
      @on-ok="onConfirmed"
  >
    <Space split>
      <TagSelector
          class="aui-i-tagFilter"
          :tags="tags"
          @on-selected="onSelectTag"/>
      <Space style="flex-wrap: wrap">
        <div v-if="selectedTags.length > 0" v-for="tag in selectedTags" :key="tag.id" class="aui-i-selected-tag">
          <Tag
              :color="tag.color" closable type="dot"
              @on-close="onDeleteTag(tag.id)"
          >
            {{ tag.name }}
          </Tag>
        </div>
        <p v-else>未选择</p>
      </Space>
    </Space>

  </Modal>
</template>
<script setup>

import TagService from '@/business/tag_service';
import {ref} from "vue";
import {Message, Modal, Space, Tag} from "view-ui-plus";
import {useModalStore} from '@/store'
import {storeToRefs} from "pinia";
import TagSelector from "@/components/tag_selector.vue";

const name = 'tagsSelectModal'
const modalStore = useModalStore()
const {tagsSelectModal} = storeToRefs(modalStore)

const selector = ref(null)
const emit = defineEmits(['update:show', 'onSelect'])
let tags = ref([])
let selectedTags = ref([])

const onVisibleChange = async (isShow) => {
  if (!isShow) return
  TagService.getTagsForProject(tagsSelectModal.value.projectId, 'normal_task').then(tagList => {
    tags.value = tagList
    selectedTags.value = tagList.filter(t => tagsSelectModal.value.selectedTagIds.includes(t.id))
  }).catch(e => {
    Message.error(e.errMsg || '获取标签失败')
  })
}

const onSelectTag = selectedTagId => {
  if (selectedTags.value.filter(tag => tag.id === selectedTagId).length > 0) {
    Message.warning('请勿重复选择')
    return
  }
  const filteredTags = tags.value.filter(t => t.id === selectedTagId)

  selectedTags.value.push(filteredTags[0])
}

const onDeleteTag = deletedTagId => {
  const index = selectedTags.value.findIndex(t => t.id === deletedTagId)
  selectedTags.value.splice(index, 1)
}

const onConfirmed = () => {
  const selectedTagIds = selectedTags.value.map(tag => tag.id)
  emit('onSelect', selectedTagIds, tagsSelectModal.value.action, {
    laneId: tagsSelectModal.value.laneId,
    taskId: tagsSelectModal.value.taskId
  })
}

</script>

<style scoped lang="less">
.aui-i-selected-tag {
  position: relative;

}
</style>
