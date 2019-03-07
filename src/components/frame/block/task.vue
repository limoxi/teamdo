<template>
	<div class="aui-task">
		<div class="aui-i-header">
			<span>Task&nbsp;{{task.id}}</span>
			<Button icon="md-arrow-round-forward" @click="onClickNext"></Button>
		</div>
		<div class="aui-i-body">
			{{task.name}}
		</div>
		<div class="aui-i-users">
			<div v-for="user in task.task_users" :key="user.id">
				<Tooltip :content="user.nickname" placement="top">
					<Avatar :src="user.avatar" :size="user.is_assignor? 'large': 'default'"></Avatar>
				</Tooltip>
			</div>
		</div>
	</div>
</template>

<script>

    import TaskService from '@/service/task_service';

    export default {
        props: ['projectId', 'task', 'lane', 'lanes'],
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
                    window.EventBus.$emit('taskLaneSwitched', [this.lane, targetLane]);
				}).catch(err=>{
                    this.$Message.warning(err.errMsg);
				});
			}
		}
    }
</script>

<style scoped lang="less">
	.aui-task{
		height: 150px;
		width: 200px;
		border-radius: 2px;
	}
</style>