<template>
  <Modal
    v-model="showModal"
    width="500"
    @on-cancel="onCancel"
  >
    <template #header></template>
    <template #footer></template>
  </Modal>
</template>

<script setup>
import {computed, ref} from 'vue'
import {FormItem, Message, Modal} from 'view-ui-plus'

const showModal = ref(false)

const onCancel = () => {
  resetForm()
}

const show = (taskId=0) => {
  showModal.value = true
}

defineExpose({
  show
})

</script>

<style lang="less" scoped>

</style>
