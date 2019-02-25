<template>
	<div class="aui-bord">
		<Lane
			v-for="lane in lanes" :key="lane.id"
			:lane="lane" :projectId="projectId"
		>
		</Lane>
	</div>
</template>

<script>

	import Lane from '@/components/frame/block/lane';
    import ProjectService from '@/service/project_service';
	import LaneService from '@/service/lane_service';

    export default {
        props: ['id'],
		created(){
            LaneService.getLanes(this.projectId, this.id).then(lanes =>{
                this.lanes = lanes;
			});
		},
        data(){
            return {
                'lanes': [],
				'projectId': ProjectService.getProjectIdFromPath(this.$route.path)
			}
		},
		components: {
            'Lane': Lane
		},
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