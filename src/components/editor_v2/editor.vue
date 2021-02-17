<template>
  <div class="el-tiptap-editor__wrapper">
    <editor
        :extensions="extensions"
        :content="!!content? JSON.parse(content): ''"
        :spellcheck="true"
        :menu-bubble-options="{ 'keep-in-bounds': false }"
        :readonly="readonly"
        output="json"
        :showMenubar="!readonly"
        :charCounterCount="false"
        placeholder="详细描述"
        @onUpdate="onUpdate"
    />
  </div>
</template>

<script>
import { ElementTiptap } from 'element-tiptap';
import {
  Doc,
  FontSize,
  FontType,
  Text,
  TextColor,
  TextHighlight,
  Paragraph,
  Heading,
  Bold,
  Underline,
  Italic,
  Strike,
  Code,
  CodeBlock,
  Link,
  Table,
  TableHeader,
  TableCell,
  TableRow,
  Image,
  Blockquote,
  ListItem,
  BulletList,
  OrderedList,
  TodoItem,
  TodoList,
  Indent,
  HardBreak,
  HorizontalRule,
  Preview,
  Fullscreen,
  History,
} from 'element-tiptap';
import events from '@/service/global_events';

export default {
  props: ['scene', 'readonly', 'content'],
  components: {
    'editor': ElementTiptap
  },
  data () {
    return {
      extensions: [
        new Doc(),
        new Text(),
        new Paragraph(),
        new Heading({ level: 3, bubble: true }),
        new Bold({ bubble: true }),
        new Underline({ bubble: true }),
        new Italic({ bubble: true }),
        new Strike({ bubble: true }),
        new Code(),
        new CodeBlock(),
        new FontType(),
        new FontSize(),
        new TextColor({ bubble: true }),
        new TextHighlight({ bubble: true }),
        new Link({ bubble: true }),
        new Table(),
        new TableHeader(),
        new TableCell(),
        new TableRow(),
        new Image(),
        new Blockquote(),
        new ListItem(),
        new BulletList(),
        new OrderedList(),
        new TodoItem(),
        new TodoList(),
        new Indent(),
        new HardBreak(),
        new HorizontalRule(),
        new Preview(),
        new Fullscreen(),
        new History(),
      ]
    };
  },
  methods: {
    onUpdate (content, options) {
      this.$emit("onUpdate", options.getJSON())
    }
  }
};
</script>
