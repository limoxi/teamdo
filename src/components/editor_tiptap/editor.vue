<template>
  <div v-if="editor">
    <BubbleMenuBlock :editor="editor"/>
    <editor-content v-if="editor" :editor="editor" class="tiptap-editor-wrapper" @click="onClickEditor"/>
  </div>
  <ImagePreview
    v-model="showImage"
    :preview-list="previewImages"/>
</template>

<script setup>
import StarterKit from '@tiptap/starter-kit'
import {BubbleMenu, EditorContent, useEditor} from '@tiptap/vue-3'
import Image from '@tiptap/extension-image'
import Highlight from '@tiptap/extension-highlight'
import {Color} from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'
import {ImagePreview} from 'view-ui-plus'
import BubbleMenuBlock from './bubble_menu'
import {ref} from 'vue'
import {Link} from '@tiptap/extension-link'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import SlashPlugin from './slash/plugin.js'
import suggestion from './slash/suggestion.js'
import {Placeholder} from '@tiptap/extension-placeholder'

const props = defineProps(['readonly', 'content'])

const showImage = ref(false)
const previewImages = ref([])

const editor = useEditor({
  extensions: [
    StarterKit,
    BubbleMenu,
    Color,
    TextStyle,
    Highlight,
    TaskList,
    TaskItem,
    Link.configure({
      openOnClick: false
    }),
    Image.configure({
      inline: true,
      allowBase64: true
    }),
    SlashPlugin.configure({
      suggestion
    }),
    Placeholder.configure({
      placeholder: 'Type / to browse options'
    })
  ],
  content: props.content,
  editable: !props.readonly
})

const onClickEditor = e => {
  if (e && e.target.nodeName === 'IMG') {
    showImage.value = true
    previewImages.value = [e.target.getAttribute('src')]
  }
}

defineExpose({
  getContent: () => {
    return editor.value.getHTML()
  },
  getAttentions: () => {
    const jsonData = editor.value.getJSON()
    console.log(jsonData)
    let attentions = []
    for (const item of jsonData.content) {
      if (item.type === 'taskList') {
        for (const taskItem of item.content) {
          if (taskItem.type === 'taskItem') {
            const checked = taskItem.attrs?.checked || false
            let content = ''
            for (const innerItem of taskItem.content) {
              if (innerItem.type === 'paragraph') {
                for (const textItem of innerItem.content) {
                  if (textItem.type === 'text') {
                    content = textItem.text
                  }
                }
              }
            }
            attentions.push({
              content: content,
              checked: checked
            })
          }
        }
      }
    }
    return attentions

  },
  resetContent: (text) => editor.value.commands.setContent(text)
})

</script>

<style lang="less" scoped>
:deep(.tiptap-editor-wrapper) {
  outline: none;
  border: 1px solid #dcdee2;
  border-radius: 4px;
  padding: 5px;

  & > div {
    outline: none;
    border: none;
  }

  .tiptap {
    min-height: 20vh;
    /* List styles */

    ul,
    ol {
      padding: 0 1rem;
      margin: 1.25rem 1rem 1.25rem 0.4rem;

      li p {
        margin-top: 0.25em;
        margin-bottom: 0.25em;
      }
    }

    /* Heading styles */

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      line-height: 1.1;
      margin-top: 2.5rem;
      text-wrap: pretty;
    }

    h1,
    h2 {
      margin-top: 3.5rem;
      margin-bottom: 1.5rem;
    }

    h1 {
      font-size: 1.4rem;
    }

    h2 {
      font-size: 1.2rem;
    }

    h3 {
      font-size: 1.1rem;
    }

    h4,
    h5,
    h6 {
      font-size: 1rem;
    }

    /* Code and preformatted text styles */

    code {
      background-color: rgba(88, 5, 255, 0.05);
      border-radius: 0.4rem;
      color: #2E2B29;
      font-size: 0.85rem;
      padding: 0.25em 0.3em;
    }

    pre {
      background: #2E2B29;
      border-radius: 0.2rem;
      color: #FFF;
      margin: 1.5rem 0;
      padding: 0.75rem 1rem;

      code {
        background: none;
        color: inherit;
        font-size: 0.8rem;
        padding: 0;
      }
    }

    blockquote {
      border-left: 3px solid rgba(61, 37, 20, 0.12);
      margin: 1.5rem 0;
      padding-left: 1rem;
    }

    hr {
      border: none;
      border-top: 1px solid rgba(61, 37, 20, 0.08);
      margin: 2rem 0;
    }

    /* Task list specific styles */

    ul[data-type="taskList"] {
      list-style: none;
      margin-left: 0;
      padding: 0;

      li {
        align-items: center;
        display: flex;

        > label {
          display: flex;
          margin-right: 0.5rem;
          user-select: none;
        }

        > div {
          flex: 1 1 auto;
          line-height: 1;
        }
      }

      input[type="checkbox"] {
        cursor: pointer;
      }

      ul[data-type="taskList"] {
        margin: 0;
      }
    }

    /* Placeholder (on every new line) */

    .is-empty::before {
      color: rgba(53, 38, 28, 0.30);
      content: attr(data-placeholder);
      float: left;
      height: 0;
      pointer-events: none;
    }
  }
}

</style>