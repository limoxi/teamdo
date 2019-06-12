<template>
	<div id="codex-editor"></div>
</template>

<script>

    import EditorJS from '@editorjs/editorjs';
    import HeaderTool from '@editorjs/header';
    import ImageTool from '@editorjs/image';
    import ChecklistTool from '@editorjs/checklist';
    import ListTool from '@editorjs/list';
    import QuoteTool from '@editorjs/quote';
    import WarningTool from '@editorjs/warning';
    import CodeTool from '@editorjs/code';
    import MarkerTool from '@editorjs/marker';
    import DelimiterTool from '@editorjs/delimiter';
	import TableTool from '@editorjs/table';
	import InlineCodeTool from '@editorjs/inline-code';

	import Resource from '@/utils/resource';

    export default {
        props: ['dataStr', 'readonly'],
		mounted(){
            this.__editor = new EditorJS({
                holderId: 'codex-editor',
                hideToolbar: true,
				tools: {
                    header: HeaderTool,
					image: {
                        class: ImageTool,
                        config: {
                            uploader:{
                                uploadByFile(file){
                                    console.log(file);
                                    Resource.use('iscrum').uploadFile({
										'filename': file.name,
										'type': file.type,
										'file': file,
									})
								}
							}
                        }
					},
					// checklist: {
                    //     class: ChecklistTool,
                    //     inlineToolbar: true
                    // },
                    list: {
                        class: ListTool,
                        inlineToolbar: true
                    },
					// quote: {
                    //     class: QuoteTool,
                    //     inlineToolbar: true,
                    //     config: {
                    //         quotePlaceholder: 'Enter a quote',
                    //         captionPlaceholder: 'Quote\'s author',
                    //     },
                    // },
                    // warning: WarningTool,
					code: CodeTool,
					maker: MarkerTool,
					delimiter: DelimiterTool,
					// table: TableTool,
					inlineCode: InlineCodeTool,
				},
                autofocus: false,
				data: JSON.parse(this.dataStr||'{}') || {},
                onChange: this.onContentChange,
			});
            this.__editor.isReady.then(()=>{
                if(this.readonly){
                    document.querySelectorAll('#codex-editor *[contenteditable=true]').forEach((x, _)=>{
                        x.setAttribute('contenteditable', null);
					})

				}
			});
		},
        data(){
            return {
				'__editor': null,
			}
		},
		methods: {
            onContentChange(){
                this.__editor.save().then(contentData=>{
					this.$emit('on-change', JSON.stringify(contentData));
				}).catch(err=>{
				    console.log(err);
				    this.$Message.error('v-editor error!')
				});
			}
		}
    }
</script>

<style scoped lang="less">
	#codex-editor{
		border: 1px solid #ddd;
		border-radius: 4px;
		padding: 5px 10px;
		cursor: text;
	}
</style>