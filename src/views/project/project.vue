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
			<user-select-model
				:show.sync="showUserSelectModel"
				:projectId="projectId"
				:singleSelect="selectSingleUser"
				:forProject="userSelectForProject"
				:filters="userSelectFilters"
				@memberSelected="onUserSelected"
			></user-select-model>
		</template>
	</top-frame>
</template>

<script>
	import TopFrame from '@/components/frame/top_frame';
	import ProjectHeader from '@/components/frame/header/project_header';
    import LaneModel from '@/components/model/lane_model';
    import TaskModel from '@/components/model/task_model';
    import UserSelectModel from '@/components/model/user_select_model';
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
                this.laneModelMode = 'create';
            });

            window.EventBus.$on(events.LANE_EDITTING, (lane, kanbanType)=>{
                this.laneModelMode = 'mod';
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

            window.EventBus.$on(events.SELECTING_USERS, data=>{
                this.showUserSelectModel = true;
                if(!helper.isEmptyObject(data)){
                    this.selectSingleUser = !!data.singleSelect;
                    this.userSelectForProject = data.forProject;
					this.userSelectFilters = data.filters || {};
                    this.userSelectCallback = data.callback;
				}
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

                showUserSelectModel: false,
                userSelectForProject: false,
                selectSingleUser: false,
                userSelectFilters: {},
                userSelectCallback: ()=>{}

			}
		},
		components: {
            'top-frame': TopFrame,
			'project-header': ProjectHeader,
            'task-model': TaskModel,
            'lane-model': LaneModel,
            'user-select-model': UserSelectModel
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
			},
            onUserSelected(ids){
                this.userSelectCallback(ids);
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