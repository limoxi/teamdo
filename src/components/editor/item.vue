<template>
    <button type="button" class="aui-editor-btn" @click="onClick">
        <svg v-if="useSVG" class="icon" aria-hidden="true">
            <use :xlink:href="href"></use>
        </svg>
        <span v-else>{{alias}}</span>
    </button>
</template>

<script>
    export default {
        props: ["editor", "item"],
        data(){
            return {
                useSVG: ![
                    'heading'
                ].includes(this.item) && this.item.indexOf('heading')!==0
            }
        },
        methods: {


        },
        computed: {
            onClick(){
                switch (this.item) {
                    case 'image':
                        return () =>{
                            let src = prompt('Enter the url of your image here');
                            if (src !== null) {
                                this.editor.commands.image({ src });
                            }
                        };
                    case 'heading-1':
                        return () =>{
                            this.editor.commands.heading({ level: 1 });
                        };
                    case 'heading-2':
                        return () =>{
                            this.editor.commands.heading({ level: 2 });
                        };
                    case 'heading-3':
                        return () =>{
                            this.editor.commands.heading({ level: 3 });
                        };

                }
                return this.editor.commands[this.item];
            },
            href(){
                return `#icon-${this.alias}`
            },
            alias(){
                return {
                    'horizontal_rule': 'hr',
                    'blockquote': 'quote',
                    'ordered_list': 'ol',
                    'bullet_list': 'ul',
                    'code_block': 'code',
                    'heading-1': 'H1',
                    'heading-2': 'H2',
                    'heading-3': 'H3',
                }[this.item] || this.item;
            }
        },
    }
</script>

<style scoped lang="less">
    @import "editor";
</style>