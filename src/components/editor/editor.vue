<template>
  <div class="aui-editor">
    <editor-menu-bar :editor="editor">
      <div class="aui-editor-item">
        <editor-item
            v-for="item in (menuItems || [])" :key="item"
            :editor="editor" :item="item"
        ></editor-item>
      </div>
    </editor-menu-bar>
    <editor-menu-bubble :editor="editor" v-slot="{ commands, isActive, menu }">
      <div
          :class="{ 'aui-editor-item': true, 'aui-menu-floating': true, 'aui-is-active': menu.isActive }"
          :style="`left: ${menu.left}px; bottom: ${menu.bottom}px;`"
      >
        <editor-item
            v-for="item in (bubbleItems || [])" :key="item"
            :editor="editor" :item="item"
        ></editor-item>
      </div>
    </editor-menu-bubble>
    <editor-floating-menu :editor="editor" v-slot="{ commands, isActive, menu }">
      <div
          :class="{ 'aui-editor-item': true, 'aui-menu-floating': true, 'aui-is-active': menu.isActive }"
          :style="`top: ${menu.top}px`"
      >
        <editor-item
            v-for="item in (floatingItems || [])" :key="item"
            :editor="editor" :item="item"
        ></editor-item>
      </div>
    </editor-floating-menu>
    <editor-content :editor="editor" class="aui-editor-content"/>
  </div>
</template>

<script>
import {Editor, EditorContent, EditorMenuBar, EditorMenuBubble, EditorFloatingMenu} from 'tiptap'
import {
  Blockquote,
  CodeBlock,
  HardBreak,
  Heading,
  OrderedList,
  BulletList,
  HorizontalRule,
  ListItem,
  TodoItem,
  TodoList,
  Bold,
  Code,
  Italic,
  Link,
  Strike,
  Underline,
  History,
  Image,
} from 'tiptap-extensions'
import './iconfont';
import EditorItem from './item';
import './editor.less';

export default {
  props: ['menuItems', 'bubbleItems', 'floatingItems', 'readonly', 'content'],
  components: {
    EditorMenuBar,
    EditorMenuBubble,
    EditorFloatingMenu,
    EditorContent,
    EditorItem,
  },
  data() {
    return {
      editor: new Editor({
        editable: !this.readonly,
        extensions: [
          new Blockquote(),
          new CodeBlock(),
          new HardBreak(),
          new Heading({levels: [1, 2, 3]}),
          new BulletList(),
          new OrderedList(),
          new HorizontalRule(),
          new ListItem(),
          new TodoItem(),
          new TodoList(),
          new Bold(),
          new Code(),
          new Italic(),
          new Link(),
          new Strike(),
          new Underline(),
          new History(),
          new Image(),
        ],
        content: this.content,
        onUpdate: e => {
          this.$emit('onUpdate', e.getHTML());
        }
      }),
    }
  },
  watch: {
    content(newContent, oldContent) {
      this.editor.setContent(newContent);
    }
  },
  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>
