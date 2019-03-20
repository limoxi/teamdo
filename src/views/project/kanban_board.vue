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
				:kanbanType="kanbanType"
				@laneDeleted="onDeleteLane"
			>
			</Lane>
			<div class="aui-i-blank"></div>
		</draggable>
	</div>

</template>

<script>
    import draggable from 'vuedraggable';
	import Lane from '@/components/frame/block/lane';
    import ProjectService from '@/service/project_service';
	import LaneService from '@/service/lane_service';

    import events from '@/service/global_events';

    export default {
        props: ['projectId'],
		created(){
            window.EventBus.$on(events.LANE_UPDATED, this.getLanes);

            this.getLanes();
		},
        data(){
            return {
                'kanbanType': 'normal',
                'lanes': [],
				'dragOptions': {
                    animation: 200,
                    group: "description",
                    disabled: false,
                    ghostClass: "ghost",
                    chosenClass: "chosen",
					handle: '.aui-board > .aui-lane > .aui-a-draggable'
				},
				'drag': false,
				'chosenLane': null,
			}
		},
		components: {
            'Lane': Lane,
			'draggable': draggable,

		},
		methods: {
            onListChange(event){
                LaneService.resort(this.projectId, this.lanes).catch(err =>{
                    console.log(err);
                    this.$Message.error('泳道排序失败');
				})
			},
            onAddLane(){
                window.EventBus.$emit(events.LANE_ADDING, this.kanbanType);
			},
            onDeleteLane(deletedLane){
                let laneIndex = this.lanes.findIndex(lane =>{
					return lane.id === deletedLane.id;
				});
				this.lanes.splice(laneIndex, 1);
			},
			getLanes(){
                LaneService.getLanes(this.projectId, this.kanbanType).then(lanes =>{
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

</style>