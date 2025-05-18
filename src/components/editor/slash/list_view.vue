<template>
  <div class="dropdown-menu">
    <template v-if="items.length">
      <Button
        text
        plain
        :class="{ 'is-selected': index === selectedIndex }"
        v-for="(item, index) in items"
        :key="index"
        @click="selectItem(index)"
      >
        <i :class="item.icon"></i>
        <span>{{item.title}}</span>
      </Button>
    </template>
    <div class="item" v-else>
      No result
    </div>
    <Modal
      v-model="showLinkModal"
      :closable="false"
      :draggable="true"
      footer-hide
      @on-cancel="onCloseLinkModal"
      :z-index="9999"
    >
      <div style="display: flex;justify-content: space-between;align-items: baseline">
        <Input placeholder="输入链接地址..." v-model="linkUrl" type="url" clearable border
               style="width: 85%"/>
        <Button label="确定" severity="success" text @click="onConfirmLink"/>
      </div>
    </Modal>
  </div>
</template>

<script setup>

import {ref, watch} from 'vue'
import Button from 'primevue/button'
import {Input, Modal} from 'view-ui-plus'

const selectedIndex = ref(0)
const linkUrl = ref('')
const showLinkModal = ref(false)
const currItem = ref(null)

const props = defineProps({
  items: Array,
  command: Function
})

watch(props.items, (newVal, oldVal) => {
  selectedIndex.value = 0
})

const onKeyDown = ({event}) => {
  if (event.key === 'ArrowUp') {
    upHandler()
    return true
  }

  if (event.key === 'ArrowDown') {
    downHandler()
    return true
  }

  if (event.key === 'Enter') {
    enterHandler()
    return true
  }

  return false
}

const upHandler = () => {
  selectedIndex.value = ((selectedIndex.value + props.items.length) - 1) % props.items.length
}

const downHandler = () => {
  selectedIndex.value = (selectedIndex.value + 1) % props.items.length
}

const enterHandler = () => {
  selectItem(selectedIndex.value)
}

const selectItem = (index) => {
  const item = props.items[index]

  if (item.title === 'Image') {
    showLinkModal.value = true
    currItem.value = item
    return
  }

  if (item) {
    props.command(item)
  }
}

const onConfirmLink = () => {
  if (currItem.value) {
    currItem.value.src = linkUrl.value
    props.command(currItem.value)
    onCloseLinkModal()
  }
}

const onCloseLinkModal = () => {
  showLinkModal.value = false
  linkUrl.value = ''
  currItem.value = null
}

defineExpose({
  onKeyDown
})

</script>

<style scoped lang="less">
.dropdown-menu {
  background: #333333;
  border: 1px solid rgba(61, 37, 20, 0.05);
  border-radius: 4px;
  box-shadow: 0 12px 33px 0 rgba(0, 0, 0, 0.06), 0 3.618px 9.949px 0 rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  overflow: auto;
  padding: 0.2rem;
  position: relative;

  button {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    background-color: transparent;
    gap: 0.25rem;
    text-align: left;
    width: 100%;
    color: whitesmoke;

    &:hover {
      background-color: #222;
    }
  }

  .is-selected {
    background-color: #222;
  }
}

</style>