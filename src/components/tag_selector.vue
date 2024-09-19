<template>
  <Select
      ref="selector"
      class="aui-tag-selector"
      clearable
      filterable
      placeholder="添加标签"
      @on-select="handleSelectTag"
  >
    <Option v-for="tag in tags" :key="tag.id" :value="tag.id">
      <Badge :color="tag.color" :text="tag.name"/>
    </Option>
  </Select>
</template>

<script setup>
import {Badge, Option, Select} from "view-ui-plus";
import {ref} from "vue";

const selector = ref(null)

const emit = defineEmits(['onSelected'])

const props = defineProps({
  tags: {
    type: Array,
    default: []
  }
})


const handleSelectTag = selectedTag => {
  emit('onSelected', selectedTag.value)
  selector.value.setQuery(null)
}

</script>

<style scoped lang="less">
.aui-tag-selector {

}
</style>