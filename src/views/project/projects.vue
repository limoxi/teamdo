<template>
	<top-frame>
		<template slot="header">
			<a-header
				@projectedCreated="onProjectCreated"
			></a-header>
		</template>
		<template slot="content">
			<ul class="aui-projects">
				<li v-for="project in projects" :key="project.id">
					<project-card
						:project="project"
					>
					</project-card>
				</li>
			</ul>
		</template>
	</top-frame>
</template>

<script>
	import TopFrame from '@src/components/frame/top_frame';
	import Header from '@src/components/frame/header/header';
	import ProjectCard from './project_card';
	import ProjectService from '@src/service/project_service';

    export default {
	    created(){
	        this.getProjects();
		},
        data(){
            return {
                projects: []
			}
		},
		components: {
            'top-frame': TopFrame,
			'a-header': Header,
			'project-card': ProjectCard
		},
		methods: {
			getProjects(){
				ProjectService.getProjects().then(data =>{
					this.projects = data;
				}).catch(err =>{
					this.$Message.error(err.errMsg);
				});
			},
            onProjectCreated(){
                this.getProjects();
			}
		}
    }
</script>

<style lang="less" scoped>
	.aui-projects{

		li{
			list-style: none;
			margin: 15px;
		}
	}

</style>