<template>
  <vue-editor :editor="editor" />
</template>

<script setup>
import { Editor, rootCtx, defaultValueCtx, editorViewOptionsCtx } from '@milkdown/core';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { VueEditor, useEditor } from '@milkdown/vue';
import { nord } from '@milkdown/theme-nord';
import { commonmark } from '@milkdown/preset-commonmark';
import {ref, onMounted, onUnmounted} from "vue";

const props = defineProps(['readonly', 'content'])
const emit = defineEmits(['onUpdate'])

let { editor } = useEditor((root) =>
  Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root)
        ctx.set(editorViewOptionsCtx, {editable: () => !props.readonly})
        ctx.get(listenerCtx).markdownUpdated((ctx, markdown, prevMarkdown) => {
          console.log(markdown)
          emit('onUpdate', markdown)
        })
        ctx.set(defaultValueCtx, props.content || '')
      })
      .use(nord)
      .use(commonmark)
      .use(listener)
);
</script>

<style lang="less">
.milkdown .editor{
  padding-top: 1em !important;
  padding-bottom: 1em !important;
  p {
    line-height: 0.1 !important;
  }
}
</style>
