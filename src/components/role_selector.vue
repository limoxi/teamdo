<template>
  <Select
      ref="selector"
      clearable
      :value="modelValue"
      :multiple="multi"
      :filterable="true"
      :remote-method="searchRole"
      @on-query-change="onQueryChange"
      @on-select="onSelectRole"
      @on-clear="onClearRole"
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
  modelValue: {
    type: String,
    default: ''
  }
})

const roles = ['研发', '测试', '产品']
const selectableRoles = ref(roles)

onMounted(() => {

})

const searchRole = (query) => {
  selectableRoles.value = roles.filter(role => {
    return !!(PinyinMatch.match(role, query)) || role === query
  })
}

const onSelectRole = selectedRole => {
  emit('onSelected', roles.find(role => role === selectedRole.value))
  selector.value.setQuery(null)
}

const onClearRole = () => {
  emit('onSelected', '')
}

const onQueryChange = query => {
  if (query === '') {
    selectableRoles.value = roles
  }
}

</script>

<style scoped lang="less">

</style>