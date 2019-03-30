<template>
	<Modal
		v-model="showModel"
		:title="title"
		width="750"
		class="aui-task-model"
	>
		<template v-if="this.mode==='create'||this.mode==='addSub'">
			<Form ref="taskForm" :model="form" :rules="ruleValidate" :label-width="80">
				<FormItem label="名称" prop="name">
					<Input v-model="form.name" placeholder=""></Input>
				</FormItem>
				<FormItem label="关联需求" prop="need_id" v-show="this.mode === 'create'">
					<Select v-model="form.need_id" style="width:180px" aria-label="needSelector">
						<Option v-for="need in needOptions" :value="need.id" :key="need.id">
							{{ need.name }}</Option>
					</Select>
				</FormItem>
				<FormItem label="重要度" prop="importance" v-show="this.mode === 'create'">
					<Select v-model="form.importance" style="width:180px" aria-label="importanceSelector">
						<Option v-for="option in importanceOptions" :value="option.value" :key="option.value">
							{{ option.label }}</Option>
					</Select>
				</FormItem>
				<FormItem label="标签" class="aui-i-tags" v-show="this.mode === 'create'">
					<Select v-model="form.tags" style="width:180px" aria-label="tagsSelector">
						<Option v-for="tag in tags" :value="tag.value" :key="tag.value">
							{{ tag.label }}</Option>
					</Select>
				</FormItem>
				<FormItem label="描述">
					<quill-editor v-model="form.desc"
								  ref="editor"
								  :options="editorOptions">
					</quill-editor>
				</FormItem>
			</Form>
			<Button slot="footer" @click="handleSubmit">确定</Button>
		</template>
		<template v-else>
			<div>
				<div>{{task.importance}}</div>
				<div>
					<Tag>{{task.tag}}</Tag>
				</div>
				<div>{{task.need_id}}</div>
				<div><span v-html="task.desc"></span></div>
			</div>
			<div slot="footer">
				<Button @click="onFetchLogs">动态</Button>
				<Button @click="onAddRemark">备注</Button>
			</div>
		</template>
	</Modal>
</template>
<script>
	import TaskService from '@/service/task_service';
    import Cookies from 'js-cookie';
	import helper from '@/utils/helper';

    export default {
        props: ['show', 'mode', 'task', 'projectId'],
		created(){

		},
        data () {
            return {
                form: {
                    name: '',
                    desc: '',
                    importance: 0,
                    newTag: '',
                    tags: [],
                    need_id: 0
				},
                needOptions: [],
				tagOptions: [],
                importanceOptions: [{
                    'label': '1(一般)',
                    'value': 1
                }, {
                    'label': '2',
                    'value': 2
                }, {
                    'label': '3',
                    'value': 3
                }, {
                    'label': '4(紧急)',
                    'value': 4
                }, {
                    'label': '5',
                    'value': 5
                }, {
                    'label': '6',
                    'value': 6
                }, {
                    'label': '7(非常紧急)',
                    'value': 7
                }, {
                    'label': '8',
                    'value': 8
                }, {
                    'label': '9',
                    'value': 9
                }],
                editorOptions:{
                    theme: 'snow',
                    modules: {
                        toolbar: [
                            ['bold', 'italic', 'underline'],        // toggled buttons
            				['blockquote', 'code-block'],
                			[{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'align': [] }],
                            ['link', 'image'],
                            [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
						]
					}
				},
                ruleValidate: {
                    name: [
                        { required: true, message: '任务标题不能为空', trigger: 'blur' }
                    ]
                }
            }
        },
        computed: {
            showModel: {
                get(){
                    return this.show;
                },
                set(newValue){
                    this.$emit('update:show', newValue);
                }
            },
            title(){
                let title = '';
                if(this.mode === 'create'){
                    title = '添加任务';
				}else if(this.mode === 'addSub'){
                    title = '添加子任务';
				}else{
                    title = '任务详情 - '+this.task.name;
				}
                return title;
			}
        },
        methods: {
			actionDone(eventName){
                this.showModel = false;
                this.resetForm();
                this.$Message.success('操作成功');
                this.$emit(eventName);
			},
            onFetchLogs(){

			},
            onAddRemark(){

			},
            handleSubmit() {
                this.$refs['taskForm'].validate((valid) => {
                    if (valid) {
                        if(this.mode === 'create'){
                            TaskService.addTask(this.projectId, this.form).then(()=>{
                                this.actionDone('taskAdded');
							}).catch(err=>{
                                this.$Message.error(err.errMsg);
							});
						}else if(this.mode === 'addSub'){
                            TaskService.addSubTask(this.projectId, this.form, this.task).then(()=>{
                                this.actionDone('taskAdded');
                            }).catch(err=>{
                                this.$Message.error(err.errMsg);
                            });
						}else{
                            TaskService.updateTask(this.projectId, this.form).then(()=>{
                                    this.actionDone('taskUpdated');
							}).catch(err=>{
                                this.$Message.error(err.errMsg);
                            });
						}
                    }else{
                        this.$Message.error('请检查填写项');
					}
                })
            },
            resetForm(){
                this.$refs['taskForm'].resetFields();
            }
        }
    }
</script>

<style scoped lang="less">
	.aui-task-model{
	}

</style>