<template>
	<div :class="headerClasses">
		<div class="aui-i-header">
			<div>
				Task&nbsp;{{task.id}}
			</div>
			<div class="aui-i-action">
				<Button icon="md-expand" class="aui-icon-scale" @click="onClickEdit"></Button>
				<Button icon="md-swap" class="aui-icon-scale"></Button>
				<Button icon="md-arrow-round-forward" class="aui-icon-scale" @click="onClickNext"></Button>
			</div>
		</div>
		<div class="aui-i-body">
			{{task.name}}
		</div>
		<div class="aui-i-users">
			<div v-for="user in task.task_users" :key="user.id" :style="user.is_assignor?'float:right;':''">
				<Tooltip :content="user.nickname" placement="top">
					<Avatar :src="user.avatar" :size="user.is_assignor? 'large': 'default'"></Avatar>
				</Tooltip>
			</div>
		</div>
	</div>
</template>

<script>

    import TaskService from '@/service/task_service';
    import events from '@/service/global_events';
    import TaskModel from '@/components/model/task_model';

    export default {
        props: ['projectId', 'task', 'lane', 'lanes'],
		data(){
            return {
			}
		},
		computed: {
            headerClasses(){
                let sufix = 'default';
                if(this.task.importance>=1 && this.task.importance<=3){
                    sufix = 'normal';
				}else if(this.task.importance>=4 && this.task.importance<=6){
                    sufix = 'warning';
				}else if(this.task.importance>=7){
                    sufix = 'sos';
				}
                return `aui-task aui-task-level-${sufix}`;
			}
		},
		methods: {
            onClickNext(){
                let targetLane;
                for(let index in this.lanes){
                    index = parseInt(index);
                    let cl = this.lanes[index];
                    if(cl.id === this.lane.id){
                        if(index === this.lanes.length - 1){
                            return;
						}
                        targetLane = this.lanes[index+1];
                        break;
					}
				}
                TaskService.switchLane(this.projectId, this.task, targetLane).then(()=>{
                    window.EventBus.$emit(events.TASK_SWITCHED, [this.lane, targetLane]);
				}).catch(err=>{
                    this.$Message.warning(err.errMsg);
				});
			},
            onClickEdit(){
                window.EventBus.$emit(events.TASK_EXPANDED, this.task);
			}
		}
    }
</script>

<style scoped lang="less">
	.aui-task{
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
		}

		.aui-i-users{
			padding: 5px;
		}
	}
</style>