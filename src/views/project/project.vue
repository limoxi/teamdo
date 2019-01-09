<template>
	<top-frame>
		<template slot="header" @onChange="onChange">
			<project-header></project-header>
		</template>
		<template slot="content">
			<router-view></router-view>
		</template>
	</top-frame>
</template>

<script>
	import TopFrame from '@src/components/frame/top_frame';
	import ProjectHeader from '@src/components/frame/header/project_header';
	import Resource from '@src/utils/resource';
    export default {
        data(){
            return {

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