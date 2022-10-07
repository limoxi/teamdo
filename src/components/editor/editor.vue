<template>
  <VueEditor :editor="editor" @click="onClickEditor($event)"/>
  <ImagePreview v-model="showImage" :preview-list="previewImages"/>
</template>

<script setup>
import {defaultValueCtx, Editor, editorViewOptionsCtx, rootCtx} from '@milkdown/core';
import {getMarkdown, replaceAll} from '@milkdown/utils';
import {listener} from '@milkdown/plugin-listener';
import {useEditor, VueEditor} from '@milkdown/vue';
import {nord} from '@milkdown/theme-nord';
import {gfm} from '@milkdown/preset-gfm';
import {ref, watch} from "vue";
import {tooltip} from "@milkdown/plugin-tooltip";
import slash from './slash'

const props = defineProps(['readonly', 'content'])

const showImage = ref(false)
const previewImages = ref([])

let ei

const {editor} = useEditor((root) => {
  ei = Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root)
        ctx.set(editorViewOptionsCtx, {editable: () => !props.readonly})
        ctx.set(defaultValueCtx, props.content)
      })
      .use(nord)
      .use(gfm)
      .use(tooltip)
      .use(slash)
      .use(listener)

  return ei
})

watch(props, (newVal, oldVal) => {
  if (newVal.content) {
    ei.action(replaceAll(newVal.content))
  } else {
    ei.action(replaceAll(''))
  }
  previewImages.value = []
})

const onClickEditor = (e) => {
  if (e.target.nodeName === 'IMG') {
    const src = e.target.getAttribute('src')
    if (src !== '') {
      previewImages.value.unshift(src)
      showImage.value = true
    }
  }
}

const getContent = () => {
  return ei.action(getMarkdown())
}

const resetContent = (content) => {
  ei.action(replaceAll(content))
  previewImages.value = []
}

defineExpose({getContent, resetContent})

</script>

<style>
@font-face {
  font-family: 'Material Icons Outlined';
  font-style: normal;
  font-weight: 400;
  src: url(./gok-H7zzDkdnRel8-DQ6KAXJ69wP1tGnf4ZGhUce.woff2) format('woff2');
}

.material-icons-outlined {
  font-family: 'Material Icons Outlined';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-feature-settings: 'liga';
  -webkit-font-smoothing: antialiased;
}

</style>

<style lang="less">
.editor-add-task {
  margin-bottom: 5px;

  i {
    transform: scale(1.7);
  }
}

.milkdown {
  border: 1px solid lightgrey;
  border-radius: 5px;
  box-shadow: none !important;
  margin-left: 0 !important;
  width: 90%;
  background: none !important;
  color: inherit !important;

  .editor {
    padding: 0.5em 1.25em !important;
  }
}
</style>
