<template>
	<div class="aui-lane">
		<div class="aui-i-header">
			<p class="aui-i-title">{{lane.name}}&nbsp;∙&nbsp;({{tasks.length}}/{{lane.max_task_count}})</p>
			<Dropdown trigger="click" placement="bottom-end" @on-click="onClickAction">
				<Icon type="md-more" size="22" class="aui-i-action"/>
				<DropdownMenu slot="list">
					<DropdownItem name="edit">修改列</DropdownItem>
					<DropdownItem name="del">删除列</DropdownItem>
				</DropdownMenu>
			</Dropdown>
		</div>
		<Task v-for="task in tasks" :key="task.id">

		</Task>
		<Modal
			v-model="showLaneModel"
			title="修改泳道"
			@on-cancel="cancel"
		>
			<Form ref="form" :model="form" :rules="ruleValidate" :label-width="85">
				<FormItem label="泳道名称" prop="name">
					<Input v-model="form.name" placeholder=""></Input>
				</FormItem>
				<FormItem label="最大任务数" prop="maxCount">
					<Input v-model="form.maxCount" placeholder="" clearable></Input>
				</FormItem>
			</Form>
			<Button slot="footer" @click="confirm">确定</Button>
		</Modal>
	</div>
</template>

<script>

	import Task from './task';
	import LaneService from '@/service/lane_service';

    export default {
        props: ['lane', 'projectId'],
		created(){

		},
		data(){
            return {
                showLaneModel: false,
                tasks: [],
				form: {
                    name: this.lane.name,
                    maxCount: this.lane.max_task_count
				},
                ruleValidate: {
                    name: [
                        {required: true, message: '泳道名称不能为空', trigger: 'blur'}
                    ],
                    maxCount: [
                        {required: true, message: '请填写泳道最大任务数', trigger: 'blur'}
                    ]
                }
			}
		},
		components: {
            'Task': Task
		},
		methods: {
            onClickAction(name){
                if(name === 'edit'){
					this.showLaneModel = true;
				}
			},
            confirm (){
                this.$refs['form'].validate((valid) => {
                    console.log(this.form);
                    if (valid) {
                        let newLane = {
                            id: this.lane.id,
							name: this.form.name,
							max_task_count: this.form.maxCount
						};
                        LaneService.updateLane(this.projectId, newLane).then(() =>{
                            this.lane.name = newLane.name;
                            this.lane.max_task_count = newLane.max_task_count;
							this.$Message.success('泳道已更新');
							this.resetForm();
						}).catch(err =>{
							this.$Message.error(err.errMsg);
						});
                    } else {
                        this.$Message.error('请检查填写项！');
                    }
                })
            },
            cancel (){
                this.resetForm();
            },
            resetForm(){
                this.showLaneModel = false;
                this.$refs['form'].resetFields();
            }
		}
    }
</script>

<style scoped lang="less">
	.aui-lane{
		height: 150vh;
		width: 280px;
		flex-shrink: 0;
		padding: 5px;
		margin: 5px;
		border-radius: 2px;
		border: 1px solid white;
		background: white;

		.aui-i-header{
			display: flex;
			justify-content: space-between;
			.aui-i-title{
				font-size: 16px;
				font-weight: bold;
			}
			.aui-i-action{
				&:hover{
					transform: scale(1.1);
					cursor: pointer;
				}
			}
		}
	}
</style>