<template>
  <VueEditor :editor="editor" />
</template>

<script setup>
import { Editor, rootCtx, defaultValueCtx, editorViewCtx, serializerCtx, editorViewOptionsCtx } from '@milkdown/core';
import { replaceAll } from '@milkdown/utils';
import { listener } from '@milkdown/plugin-listener';
import { VueEditor, useEditor } from '@milkdown/vue';
import { nord } from '@milkdown/theme-nord';
import { commonmark } from '@milkdown/preset-commonmark';
import {watch} from "vue";

const props = defineProps(['readonly', 'content'])

watch(props, (newVal, oldVal) => {
  const ed = getInstance()
  if(newVal.content) {
    ed.action(replaceAll(newVal.content))
  } else {
    ed.action(replaceAll(''))
  }
})

const { editor, getInstance } = useEditor((root) =>
  Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root)
        ctx.set(editorViewOptionsCtx, {editable: () => !props.readonly})
        ctx.set(defaultValueCtx, props.content)
      })
      .use(nord)
      .use(commonmark)
      .use(listener)
);

const getContent = () => {
  return getInstance().action(ctx => {
    const view = ctx.get(editorViewCtx)
    const s = ctx.get(serializerCtx)
    return s(view.state.doc)
  })
}

defineExpose({getContent})

</script>

<style lang="less">
.milkdown {
  border: 1px solid lightgrey;
  border-radius: 5px;
  box-shadow: none !important;
  margin-left: 0 !important;
  width: 90%;
  background: none !important;
  color: inherit !important;
  .editor{
    padding: 0.5em 1.25em !important;
  }
}
</style>
