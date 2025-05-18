<template>
  <BubbleMenu
    v-if="editor"
    :editor="editor"
    :should-show="(inst) => {
        return !inst.editor.isActive('image') && !inst.state.selection.empty
      }"
    :tippy-options="{ duration: 100 }"
    class="bubble-menu"
  >
    <Menubar :model="items">
      <template #item="{ item, props, hasSubmenu, root }">
        <Button :class="{ 'is-active': editor.isActive(item.name) }" plain size="small" style="padding: 0"
                text
                @click="item.onClick">
          <span :class="item.icon"></span>
          <span v-if="item.label">{{item.label}}</span>
        </Button>
      </template>
    </Menubar>
  </BubbleMenu>
  <Popover ref="showColorPicker" :baseZIndex="9999" appendTo="body">
    <ColorPicker :debounce="100" :isWidget="true" format="hex"
                 pickerType="fk" :roundHistory="true" shape="circle" @pureColorChange="onChangeColor"/>
  </Popover>
</template>

<script setup>

import {BubbleMenu} from '@tiptap/vue-3'
import Button from 'primevue/button'
import Menubar from 'primevue/menubar'
import Popover from 'primevue/popover'
import {ColorPicker} from 'vue3-colorpicker'
import {ref} from 'vue'

const props = defineProps(['editor'])

const showColorPicker = ref()

const items = ref([{
  'name': 'bold',
  'icon': 'ri ri-bold',
  'command': () => {
    props.editor.chain().focus().toggleBold().run()
  }
}, {
  'name': 'italic',
  'icon': 'ri ri-italic',
  'command': () => {
    props.editor.chain().focus().toggleItalic().run()
  }
}, {
  'name': 'strike',
  'icon': 'ri ri-strikethrough',
  'command': () => {
    props.editor.chain().focus().toggleStrike().run()
  }
}, {
  'name': 'highlight',
  'icon': 'ri ri-mark-pen-fill',
  'command': () => {
    props.editor.chain().focus().toggleHighlight('#F0BB40').run()
  }
}, {
  'name': 'code',
  'icon': 'ri ri-code-view',
  'command': () => {
    props.editor.chain().focus().toggleCode().run()
  }
}, {
  'name': 'textStyle',
  'icon': 'ri ri-palette-line',
  'onClick': (e) => {
    showColorPicker.value.toggle(e)
  }
}
])

const onChangeColor = colorHex => {
  props.editor.chain().focus().setColor(colorHex).run()
}

</script>

<style lang="less" scoped>
.p-menubar {
  padding: 5px;
}

.p-button {
  padding: 0;
}

.is-active {
  background: #6A00F5 !important;
  color: #FFF !important;
}

.ri {
  padding: 8px;
  line-height: 1;

}
</style>