<template>
	<top-frame>
		<template slot="header">
			<a-header></a-header>
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
	import Resource from '@src/utils/resource';
	var projects = [{
	    id: 1,
		name: '第一个示例项目',
		desc: '这是一个项目的简单描述',
		createdAt: '2019-01-06 23:30:00'
	}];
	{
        Resource.use('iscrum').get({
			'resource': 'project.projects',
			'data': {},
			'success': (data) =>{
			    projects = data.projects;
			},
			'error': (resp) =>{
			    console.warn(resp.errMsg);
			}
		});
	}
    export default {
        data(){
            return {
                projects: projects
			}
		},
		components: {
            'top-frame': TopFrame,
			'a-header': Header,
			'project-card': ProjectCard
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