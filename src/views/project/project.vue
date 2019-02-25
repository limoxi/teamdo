<template>
	<top-frame>
		<template slot="header">
			<project-header
				:project="project"
			></project-header>
		</template>
		<template slot="content">
			<router-view></router-view>
		</template>
	</top-frame>
</template>

<script>
	import TopFrame from '@/components/frame/top_frame';
	import ProjectHeader from '@/components/frame/header/project_header';
	import ProjectService from '@/service/project_service';
	import helper from '@/utils/helper';

    export default {
        props: ['id', 'name'],
        beforeRouteUpdate(to, from , next){
          	if(to.path.includes('project')){
                this.handleProjectFetched();
			}
          	next();
		},
        data(){
            return {
				project: {
				    id: this.id,
					name: this.name,
					kanban: {},
					sprint: {}
				}
			}
		},
		created(){
            ProjectService.getProject(this.project.id).then(data =>{
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
               	this.handleProjectFetched();
			});
		},
		components: {
            'top-frame': TopFrame,
			'project-header': ProjectHeader
		},

		methods: {
            handleProjectFetched(){
                window.EventBus.$emit('projectFetched', this.project);
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