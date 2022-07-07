<template>
  <div id="vditor" />
</template>

<script setup>
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import {ref, onMounted, onUnmounted} from "vue";

const props = defineProps(['readonly', 'content'])
const editor = ref(null)

onMounted(() => {
  editor.value = new Vditor('vditor', {
    mode:'wysiwyg',
    value: props.content,
    toolbar:[]
  })
})

onUnmounted(() => {
  editor.value.destroy()
})

const getContent = () => {
  return editor.value.getValue()
}
</script>
