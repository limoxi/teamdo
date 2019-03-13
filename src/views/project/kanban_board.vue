<template>
	<div @keyup.ctrl.78.exact="onAddLane" tabindex="0" style="outline: 0"
		 @focus="onFocus"
		@blur="onBlur"
	>
		<draggable
			class="aui-board"
			v-model="lanes"
			:options="dragOptions"
			@start="drag = true"
			@end="drag = false"
			@change="onListChange"
		>
				<Lane
					v-for="(lane, index) in lanes"
					:key="lane.id"
					:index="index"
					:lane="lane"
					:lanes="lanes"
					:projectId="projectId"
					@laneDeleted="onDeleteLane"
				>
				</Lane>
		</draggable>
		<lane-model
			:show.sync="showLaneModel"
			:projectId="projectId"
			:kanbanId="id"
			:lane="chosenLane"
			:mode="laneModelMode"
		></lane-model>
		<task-model
			mode="mod"
			:show.sync="showTaskModel"
			:projectId="projectId"
			:task="chosenTask"
		></task-model>
	</div>

</template>

<script>
    import draggable from 'vuedraggable';
	import Lane from '@/components/frame/block/lane';
    import ProjectService from '@/service/project_service';
	import LaneService from '@/service/lane_service';
    import LaneModel from '@/components/model/lane_model';
    import TaskModel from '@/components/model/task_model';
    import events from '@/service/global_events';

    export default {
        props: ['id'],
		created(){
            window.EventBus.$on(events.LANE_UPDATED, this.getLanes);
            window.EventBus.$on(events.TASK_EXPANDED, task=>{
                this.chosenTask = task;
                this.showTaskModel = true;
			});
            window.EventBus.$on(events.LANE_EDITTING, lane=>{
               	this. laneModelMode = 'mod';
               	this.chosenLane = lane;
               	this.showLaneModel = true;
			});
            this.getLanes();
		},
        data(){
            return {
                'lanes': [],
				'projectId': ProjectService.getProjectIdFromPath(this.$route.path),
				'dragOptions': {
                    animation: 200,
                    group: "description",
                    disabled: false,
                    ghostClass: "ghost",
                    chosenClass: "chosen",
					handle: '.aui-board > .aui-lane > .aui-a-draggable'
				},
				'drag': false,
				'laneModelMode': 'create',
				'showLaneModel': false,
				'chosenLane': null,
				'showTaskModel': false,
				'chosenTask': {}
			}
		},
		components: {
            'Lane': Lane,
			'draggable': draggable,
            'lane-model': LaneModel,
			'task-model': TaskModel
		},
		methods: {
            onListChange(event){
                LaneService.resort(this.projectId, this.lanes).catch(err =>{
                    console.log(err);
                    this.$Message.error('泳道排序失败');
				})
			},
            onAddLane(){
                this.laneModelMode = 'create';
				this.showLaneModel = true;
			},
            onDeleteLane(deletedLane){
                let laneIndex = this.lanes.findIndex(lane =>{
					return lane.id === deletedLane.id;
				});
				this.lanes.splice(laneIndex, 1);
			},
			getLanes(){
                LaneService.getLanes(this.projectId, this.id).then(lanes =>{
                    this.lanes = lanes;
                });
			},
            onFocus(){
                window.EventBus.$emit('helpRequested', 'Try Ctrl + N');
			},
            onBlur(){
                window.EventBus.$emit('helpDone');
			}
		}
    }
</script>

<style lang="less" scoped>
	.aui-kanban-header{
		display: flex;
		justify-content: flex-start;
		padding: 0 80px;

		div{
			margin: 0 10px;
		}

		.aui-i-title{
			font-size: 20px;
		}
	}
</style>