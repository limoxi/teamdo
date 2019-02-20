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

    export default {
        data(){
            return {
				project: {
				    id: this.$route.params.id,
					name: this.$route.params.name
				}
			}
		},
		created(){
          	this.$router.push({
				'name': 'kanban'
			});
		},
		components: {
            'top-frame': TopFrame,
			'project-header': ProjectHeader
		},

		methods: {
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