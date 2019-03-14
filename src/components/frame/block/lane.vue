<template>
	<div class="aui-lane">
		<div :class="className">
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
	</div>
</template>

<script>
	import Task from './task';
    import LaneService from '@/service/lane_service';
    import events from '@/service/global_events';
    import helper from '@/utils/helper';

    export default {
        props: ['lane', 'projectId', 'kanbanId', 'lanes', 'index'],
		created(){
			this.getTasks();

			window.EventBus.$on(events.TASK_SWITCHED, (task, srcLaneId, destLaneId) =>{
			    if(srcLaneId === this.lane.id){
			        helper.removeFromArray(task, this.tasks, 'id');
				}else if(destLaneId === this.lane.id){
			        this.tasks.push(task);
				}
			});
		},
		data(){
            return {
                showLaneModel: false,
                tasks: [],
			}
		},
		components: {
            'Task': Task
		},
		computed:{
            className(){
                if(this.index===0 || this.index===this.lanes.length-1){
                    return 'aui-i-header';
				}else{
                    return 'aui-i-header aui-a-draggable';
				}
			}
		},
		methods: {
            isFull(){
				return this.tasks.length === this.lane.wip;
            },
            getTasks(){
                LaneService.getTasks(this.projectId, this.lane.id).then(data=>{
                    this.tasks = data['tasks'];
				}).catch(err=>{
                    this.$Message.error(err.errMsg);
				})
			},
            onClickAction(name){
                if(name === 'edit'){
					window.EventBus.$emit(events.LANE_EDITTING, this.lane);
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
	.ghost{
		visibility: hidden;
	}
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
			&:hover{
				cursor: grab;
			}
			.aui-i-title{
				font-size: 16px;
				font-weight: bold;
			}
			.aui-i-action{
				&:hover{
					transform: scale(1.1);
					cursor: auto;
				}
			}
		}

		.aui-i-tasks{
		}
	}
</style>