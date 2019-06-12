<template>
	<div :class="headerClasses">
		<div class="aui-i-header">
			<div>
				用户故事&nbsp;{{task.id}}
			</div>
			<div class="aui-i-action">
				<Button v-show="inFirstLane" icon="ios-undo" class="aui-icon-scale" @click="onClickUndo"></Button>
				<Button v-show="!inFirstLane&&!inLastLane" icon="md-flash" class="aui-icon-scale" @click="onClickFlash"></Button>
				<Button icon="md-book" class="aui-icon-scale" @click="onClickEdit(task)"></Button>
				<Button icon="md-add" class="aui-icon-scale" @click="onClickAddSub"></Button>
				<Dropdown trigger="click" placement="bottom" @on-click="onClickSwitch">
					<Button icon="md-swap" class="aui-icon-scale"></Button>
					<DropdownMenu slot="list">
						<DropdownItem v-for="l in lanes" :key="l.id" :name="l.id"
									  v-if="lane.id !== l.id">{{l.name}}</DropdownItem>
					</DropdownMenu>
				</Dropdown>
				<Button icon="md-arrow-round-forward" class="aui-icon-scale" @click="onClickNext"></Button>
			</div>
		</div>
		<div class="aui-i-body">
			<div class="aui-i-status">
				<Tag :color="importanceColor">{{importanceDesc}}</Tag>
				<Tag color="primary">{{task.NUT}}点 / {{task.elapsed_time||0}}</Tag>
				<Tag color="cadetblue" v-if="task.sub_tasks.length > 0"
					 checkable fade class="aui-i-sub-tasks" @on-change="toggleSubTasks">
					{{task.sub_tasks.filter(st=>{return st.status!=='进行中'}).length}} / {{task.sub_tasks.length}} 任务
				</Tag>
			</div>
			<div class="aui-i-sub-tasks" v-if="showSubTasks">
				<div v-for="subTask in task.sub_tasks" :key="subTask.id" class="aui-task-type-sub_task">
					<div class="aui-i-header">
						<div>
							<span>任务 {{subTask.id}}</span>
							<Tag color="#669999" style="margin-top: -1px">{{subTask.elapsed_time || 0}}</Tag>
							<Tag color="#669999" style="margin-top: -1px">{{subTask.status}}</Tag>
						</div>
						<div class="aui-i-action" style="display: inline-block;line-height: 23px;">
							<Button v-if="subTask.status==='进行中'" icon="md-close" class="aui-icon-scale" @click="onClickAbortSubTask(subTask)"></Button>
							<Button icon="md-qr-scanner" class="aui-icon-scale" @click="onClickEdit(subTask)"></Button>
							<Button v-if="subTask.status==='进行中'" icon="md-checkmark" class="aui-icon-scale" @click="onClickFinishSubTask(subTask)"></Button>
						</div>
					</div>
					<div class="aui-i-body">
						<s v-if="subTask.status==='已放弃'">{{subTask.name}}</s>
						<span v-else>{{subTask.name}}</span>
					</div>
				</div>
			</div>
			<div class="aui-i-name">
				{{task.name}}
			</div>
			<div class="aui-i-users">
				<div v-for="user in task.users" :key="user.id" :style="user.is_assignor?'float:right;':''">
					<Tooltip :content="user.nickname" placement="top">
						<Avatar :src="user.avatar" :size="user.is_assignor? 'large': 'default'"></Avatar>
					</Tooltip>
				</div>
			</div>
		</div>
	</div>
</template>

<script>

    import TaskService from '@/service/task_service';
    import events from '@/service/global_events';
    import helper from '@/utils/helper';

    export default {
        props: ['projectId', 'task', 'lane', 'lanes', 'inFirstLane', 'inLastLane'],
		data(){
            return {
                showSubTasks: false
			}
		},
		computed: {
            headerClasses(){
                return `aui-task aui-task-type-${this.task.type}`;
			},
            importanceDesc(){
                let imp = this.task.importance;
                let str = '';
                if(imp <= 3){
                    str = '一般';
				}else if(imp <= 6){
                    str = '紧急';
				}else if(imp <= 9){
                    str = '非常紧急';
				}
                return str;
			},
			importanceColor(){
                let imp = this.importanceDesc;
                let clr = 'success';
                if(imp === '紧急'){
                    clr = 'warning';
				}else if(imp === '非常紧急'){
                    clr = 'error';
				}
                return clr;
			}
		},
		methods: {
            toggleSubTasks(checked){
                this.showSubTasks = !checked;
			},
            onChangeProgress(task){
				console.log(task.progress);
			},
            onClickAbortSubTask(subTask){
                TaskService.abortTask(this.projectId, subTask).then(()=>{
                    helper.removeFromArray(subTask, this.task.sub_tasks, 'id')
                }).catch(err=>{
                    this.$Message.warning(err.errMsg);
                });
			},
            onClickFinishSubTask(subTask){
                TaskService.finish(this.projectId, subTask).then(()=>{
                    subTask.status = '已完成';
                }).catch(err=>{
                    this.$Message.warning(err.errMsg);
                });
			},
            onClickNext(){
                let targetLane;
                for(let index in this.lanes){
                    index = parseInt(index);
                    let cl = this.lanes[index];
                    if(cl.id === this.lane.id){
                        if(index === this.lanes.length - 1){
                            TaskService.finish(this.projectId, this.task).then(()=>{
                                window.EventBus.$emit(events.TASK_REMOVED, this.task, this.lane.id);
                            }).catch(err=>{
                                this.$Message.warning(err.errMsg);
                            });
                            return;
						}
                        targetLane = this.lanes[index+1];
                        break;
					}
				}
                TaskService.switchLane(this.projectId, this.task, targetLane.id).then(()=>{
                    window.EventBus.$emit(events.TASK_SWITCHED, this.task, this.lane.id, targetLane.id);
				}).catch(err=>{
                    this.$Message.warning(err.errMsg);
				});
			},
            onClickSwitch(targetLaneId){
                TaskService.switchLane(this.projectId, this.task, targetLaneId).then(()=>{
                    window.EventBus.$emit(events.TASK_SWITCHED, this.task, this.lane.id, targetLaneId);
                }).catch(err=>{
                    this.$Message.warning(err.errMsg);
                });
			},
            onClickEdit(selectedTask){
                TaskService.getTask(this.projectId, selectedTask.id).then(task=>{
                    window.EventBus.$emit(events.TASK_EXPANDED, task);
				}).catch(err=>{
				   	this.$Message.error(err.errMsg);
				});
			},
            onClickFlash(){
                console.log('notify');
			},
            onClickUndo(){
                TaskService.undoTask(this.projectId, this.task).then(()=>{
                    window.EventBus.$emit(events.TASK_REMOVED, this.task, this.lane.id);
				}).catch(err=>{
                    this.$Message.warning(err.errMsg);
                });
			},
            onClickAddSub(){
				window.EventBus.$emit(events.SUB_TASK_EDITTING, this.task);
			}
		}
    }
</script>

<style scoped lang="less">
	.aui-task{
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		margin: 5px 0;
		min-height: 150px;
		border-radius: 2px;

		&:hover{
			.aui-i-header{
				.aui-i-action{
					display: inline-block;
				}
			}
		}

		.aui-i-header{
			display: flex;
			justify-content: space-between;
			padding: 5px;
			color: #fff;
			font-size: 14px;
			font-weight: bold;

			.aui-i-action{
				display: none;
				line-height: 0;
			}
		}

		.aui-i-body{
			padding: 5px;
			font-size: 14px;
			display: flex;
			justify-content: flex-start;
			flex-direction: column;

			.aui-i-name{
				min-height: 45px;
				display: flex;
				align-items: center;
			}

			.aui-i-sub-tasks{
				border-radius: 5px;
				overflow: hidden;

				.aui-task-type-sub_task {
					margin-top: 2px;
					.aui-i-header, .aui-i-body{
						background-color: cadetblue;
						color: whitesmoke;
					}
				}
			}

			.aui-i-users{
				padding: 5px;
			}
		}

		.aui-task-type-sub_task{
			min-height: 50px;
		}

	}

	// 任务类型主题
	.aui-task-type-task {
		.aui-i-header {
			background-color: #FF9900;
		}
	}
	.aui-task-type-bug{
		.aui-i-header{
			background-color: #FD6E6A;
		}
	}
</style>