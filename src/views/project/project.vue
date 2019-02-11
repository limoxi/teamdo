<template>
	<top-frame>
		<template slot="header" @onChange="onChange">
			<project-header
				:projectId="projectId"
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
				projectId: this.$route.params.id
			}
		},
		components: {
            'top-frame': TopFrame,
			'project-header': ProjectHeader
		},

		methods: {
            onChange(name){

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