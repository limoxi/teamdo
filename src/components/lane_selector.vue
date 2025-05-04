<template>
  <Select
      ref="selector"
      :size="size"
      class="aui-lane-selector"
      clearable
      filterable
      placeholder="添加泳道"
      @on-select="handleSelectLane"
  >
    <Option v-for="lane in lanes" :key="lane.id" :value="lane.id">
      {{ lane.name }}
    </Option>
  </Select>
</template>

<script setup>
import {Option, Select} from "view-ui-plus";
import {ref} from "vue";

const selector = ref(null)

const emit = defineEmits(['onSelected'])

const props = defineProps({
  lanes: {
    type: Array,
    default: []
  },
  size: {
    type: String,
    default: 'default'
  }
})


const handleSelectLane = selectedLaneId => {
  emit('onSelected', selectedLaneId.value)
  selector.value.setQuery(null)
}

</script>

<style scoped lang="less">
.aui-lane-selector {

}
</style>