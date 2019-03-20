<template>
	<top-frame>
		<template slot="header">
			<project-header
				:project="project"
			></project-header>
		</template>
		<template slot="content">
			<router-view></router-view>
			<!-- model -->
			<lane-model
				:show.sync="showLaneModel"
				:projectId="projectId"
				:kanbanType="kanbanType"
				:lane="modelLane"
				:mode="laneModelMode"
			></lane-model>
			<task-model
				:mode="taskModelMode"
				:show.sync="showTaskModel"
				:projectId="projectId"
				:task="modelTask"
			></task-model>
		</template>
	</top-frame>
</template>

<script>
	import TopFrame from '@/components/frame/top_frame';
	import ProjectHeader from '@/components/frame/header/project_header';
    import LaneModel from '@/components/model/lane_model';
    import TaskModel from '@/components/model/task_model';
	import ProjectService from '@/service/project_service';
    import events from '@/service/global_events';
	import helper from '@/utils/helper';

    export default {
        props: ['projectId', 'name'],
		provide(){
            return{
			}
		},
        created(){

            window.EventBus.$on(events.LANE_ADDING, kanbanType=>{
                this.kanbanType = kanbanType;
                this.showLaneModel = true;
            });

            window.EventBus.$on(events.LANE_EDITTING, (lane, kanbanType)=>{
                this. laneModelMode = 'mod';
                this.kanbanType = kanbanType;
                this.modelLane = lane;
                this.showLaneModel = true;
            });

            window.EventBus.$on(events.TASK_EXPANDED, task=>{
                this.showTaskModel = true;
                this.taskModelMode = 'mod';
                this.modelTask = task;
            });

            window.EventBus.$on(events.SUB_TASK_EDITTING, task=>{
                this.showTaskModel = true;
                this.taskModelMode = 'addSub';
                this.modelTask = task;
            });

        },
        data(){
            return {
				project: {
				    id: this.projectId,
					name: this.name,
					kanban: {},
					sprint: {}
				},
                showTaskModel: false,
                taskModelMode: 'mod',
                modelTask: {},

                showLaneModel: false,
                laneModelMode: 'create',
                modelLane: {},
                kanbanType: 'normal',

			}
		},
		components: {
            'top-frame': TopFrame,
			'project-header': ProjectHeader,
            'task-model': TaskModel,
            'lane-model': LaneModel
		},

		methods: {
            getProject(){
                ProjectService.getProject(this.projectId).then(data =>{
                    this.project = {
                        id: data.id,
                        name: data.name
                    };
                    if(!helper.isEmptyObject(data.kanban)){
                        this.project['kanban'] = {
                            id: data.kanban.id
                        }
                    }
                    if(!helper.isEmptyObject(data.sprint)){
                        this.project['sprint'] = {
                            id: data.sprint.id,
                            name: data.sprint.name,
                            startTime: data.sprint.start_time,
                            endTime: data.sprint.endTime
                        }
                    }
                });
			}
		}
    }
</script>

<style scoped lang="less">
	.aui-projects{

		li{
			list-style: none;
			margin: 15px;
		}
	}

</style>