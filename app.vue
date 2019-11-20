<template>
    <Editor
        :menuItems="menuItems"
        :bubbleItems = "bubbleItems"
        :floatingItems = "floatingItems"
    ></Editor>
</template>

<script>
    import Editor from "@/components/editor/editor";

    export default {
        components: {
            Editor,
        },
        data() {
            return {
                menuItems: [
                    'bold',
                    'italic',
                    'strike',
                    'underline',
                    'ordered_list',
                    'bullet_list',
                    // 'horizontal_rule',
                    'blockquote',
                    'code_block',
                    'heading-1',
                    'heading-2',
                    'heading-3',
                    'paragraph',
                    'undo',
                    'redo',
                    'image',
                ],
                bubbleItems: [
                    'bold',
                    'code',
                    'heading-1',
                    'heading-2',
                    'heading-3',
                ],
                floatingItems: [
                    'heading-1',
                    'heading-2',
                    'heading-3',
                    'ordered_list',
                    'bullet_list',
                    'blockquote',
                ]
            }
        },
    }
</script>