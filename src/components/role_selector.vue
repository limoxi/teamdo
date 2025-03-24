<template>
  <Select
      ref="selector"
      clearable
      :value="modalValue"
      :multiple="multi"
      :filterable="true"
      :remote-method="searchRole"
      @on-query-change="onQueryChange"
      @on-select="onSelectRole"
      style="width: 150px"
  >
    <Option v-for="role in selectableRoles" :value="role" :key="role">
      {{ role }}
    </Option>
  </Select>
</template>

<script setup>
import {Option} from "view-ui-plus";
import PinyinMatch from "pinyin-match";
import {onMounted, ref} from "vue";

const selector = ref(null)

const emit = defineEmits(['onSelected', 'update:modelValue'])

const props = defineProps({
  multi: {
    type: Boolean,
    default: false
  },
  modalValue: {
    type: String,
    default: ''
  }
})

const selectableRoles = ref([])
const roles = ref(['研发', '测试', '产品'])

onMounted(() => {

})

const searchRole = (query) => {
  selectableRoles.value = roles.value.filter(role => {
    return !!(PinyinMatch.match(role, query)) || role === query
  })
}

const onSelectRole = selectedRole => {
  emit('onSelected', roles.value.find(role => role === selectedRole.value))
  selector.value.setQuery(null)
}

const onQueryChange = query => {
  if (query === '') {
    selectableRoles.value = roles.value
  }
}

</script>

<style scoped lang="less">

</style>