<template>
  <div v-if="editor">
    <BubbleMenuBlock :editor="editor"/>
    <editor-content v-if="editor" :editor="editor" :class="classes" @click="onClickEditor"/>
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
import {computed, ref, watch} from 'vue'
import {Link} from '@tiptap/extension-link'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import SlashPlugin from './slash/plugin.js'
import suggestion from './slash/suggestion.js'
import {Placeholder} from '@tiptap/extension-placeholder'
import Resource from '@/utils/resource'
import FileHandler from '@tiptap-pro/extension-file-handler'
import Video from '@/components/editor_tiptap/video'

const props = defineProps(['readonly', 'content'])
watch(props, (newV, oldV) => {
  if (newV.content) {
    setContent(newV.content)
  }
})

const classes = computed(() => {
  return [
    'tiptap-editor-wrapper',
    {
      'no-border': props.readonly
    }
  ]
})

const validMimeTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'video/webm', 'video/mp4']

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
    Video.configure({
      inline: true,
      allowBase64: true
    }),
    SlashPlugin.configure({
      suggestion
    }),
    Placeholder.configure({
      placeholder: 'Type / to browse options'
    }),
    FileHandler.configure({
      onPaste: (currentEditor, files, htmlContent) => {
        files.forEach(file => {
          console.log(file)
          if (!validMimeTypes.includes(file.type)) {
            alert('不支持的文件类型')
            return true
          }
          if (htmlContent) {
            // if there is htmlContent, stop manual insertion & let other extensions handle insertion via inputRule
            // you could extract the pasted file from this url string and upload it to a server for example
            console.log(htmlContent) // eslint-disable-line no-console
            return false
          }

          if (file.size / 1024 / 1024 > 100) {
            alert('只支持100M以下的文件！')
            return true
          }
          const fileType = file.type.split('/')[0]

          Resource.uploadFile(file, true).then(data => {
            currentEditor.chain().insertContentAt(currentEditor.state.selection.anchor, {
              type: fileType,
              attrs: {
                src: data.path
              }
            }).focus().run()
          })
        })
      }
    })
  ],
  content: props.content,
  editable: !props.readonly,
  editorProps: {}
})

const onClickEditor = e => {
  if (e && e.target.nodeName === 'IMG') {
    showImage.value = true
    previewImages.value = [e.target.getAttribute('src')]
  }
}

const setContent = (content) => {
  editor.value.commands.setContent(content)
}

defineExpose({
  getContent: () => {
    return editor.value.getHTML()
  },
  getAttentions: () => {
    const jsonData = editor.value.getJSON()
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
  getOutlines: () => {
    const jsonData = editor.value.getJSON()
    let outlines = []
    for (const item of jsonData.content) {
      if (item.type === 'bulletList') {
        for (const taskItem of item.content) {
          if (taskItem.type === 'listItem') {
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
            outlines.push(content)
          }
        }
      }
    }
    return outlines

  },
  resetContent: (text) => setContent(text)
})

</script>

<style lang="less" scoped>
@import "style.less";

</style>