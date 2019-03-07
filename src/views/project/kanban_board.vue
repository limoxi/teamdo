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
				v-for="lane in lanes" :key="lane.id"
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
			mode="create"
		></lane-model>
	</div>

</template>

<script>
    import draggable from 'vuedraggable';
	import Lane from '@/components/frame/block/lane';
    import ProjectService from '@/service/project_service';
	import LaneService from '@/service/lane_service';
    import LaneModel from '@/components/model/lane_model';

    export default {
        props: ['id'],
		created(){
            window.EventBus.$on('laneUpdated', this.getLanes);
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
					handle: '.aui-board > .aui-lane > .aui-i-header'
				},
				'drag': false,
				'showLaneModel': false
			}
		},
		components: {
            'Lane': Lane,
			'draggable': draggable,
            'lane-model': LaneModel
		},
		methods: {
            onListChange(event){
                LaneService.resort(this.projectId, this.lanes).catch(err =>{
                    console.log(err);
                    this.$Message.error('泳道排序失败');
				})
			},
            onAddLane(){
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