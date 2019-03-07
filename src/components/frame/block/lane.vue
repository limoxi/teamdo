<template>
	<div class="aui-lane">
		<div class="aui-i-header">
			<p class="aui-i-title">{{lane.name}}&nbsp;∙&nbsp;({{tasks.length}}/{{lane.wip}})</p>
			<Dropdown trigger="click" placement="bottom-end" @on-click="onClickAction">
				<Icon type="md-more" size="22" class="aui-i-action"/>
				<DropdownMenu slot="list">
					<DropdownItem name="edit">修改列</DropdownItem>
					<DropdownItem name="del">删除列</DropdownItem>
				</DropdownMenu>
			</Dropdown>
		</div>
		<div class="aui-i-tasks">
			<Task v-for="task in tasks" :key="task.id"
				  :task="task" :lane="lane" :lanes="lanes" :projectId="projectId"></Task>
		</div>
		<lane-model
			:show.sync="showLaneModel"
			:projectId="projectId"
			mode="edit"
			:lane="lane"
		></lane-model>
	</div>
</template>

<script>
	import Task from './task';
	import LaneModel from '@/components/model/lane_model';
    import LaneService from '@/service/lane_service';

    export default {
        props: ['lane', 'projectId', 'kanbanId', 'lanes'],
		created(){
			this.getTasks();
		},
		data(){
            return {
                showLaneModel: false,
                tasks: [],
			}
		},
		components: {
            'Task': Task,
			'lane-model': LaneModel
		},
		methods: {
            getTasks(){
                LaneService.getTasks(this.projectId, this.lane.id).then(data=>{
                    this.tasks = data['tasks'];
				}).catch(err=>{
                    this.$Message.error(err.errMsg);
				})
			},
            onClickAction(name){
                if(name === 'edit'){
					this.showLaneModel = true;
				}else if(name === 'del'){
                    this.$Modal.confirm({
                        title: '删除泳道',
                        content: '<strong>确定要删除该泳道么？</strong><p>请在删除前清理掉泳道中的任务！！！</p>',
                        okText: '确认',
                        cancelText: '等一下',
                        onOk: () =>{
                            LaneService.deleteLane(this.projectId, this.lane).then(() =>{
                                this.$emit('laneDeleted', this.lane);
                            }).catch(err =>{
                                this.$Message.error(err.errMsg);
                            });
                        }
                    });
				}
			},
		}
    }
</script>

<style scoped lang="less">
	.aui-lane{
		outline: 0;
		height: 100vh;
		width: 280px;
		flex-shrink: 0;
		padding: 5px;
		margin: 5px;
		border-radius: 5px;
		border: 1px solid white;

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

		.aui-i-tasks{
		}
	}
</style>