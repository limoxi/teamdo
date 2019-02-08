<template>
	<Header class="aui-header">
		<logo></logo>
		<div class="aui-i-menu">
			<!--<span>项目</span>-->
		</div>
		<div class="aui-i-action">
			<Button type="primary" icon="md-add" @click="addProject">添加项目</Button>
			<profile></profile>
		</div>
		<project-model
			mode="create"
			:show.sync="showModel"
			@projectCreated="onProjectCreated"
		></project-model>
	</Header>
</template>
<script>
    import ProjectModel from '@src/components/model/project_model';
    import Logo from '@src/components/frame/block/logo';
    import Profile from '@src/components/frame/block/profile';
    export default {
		data: function () {
		    return {
                showModel: false,
			}
        },
        components: {
            'project-model': ProjectModel,
			'logo': Logo,
			'profile': Profile
        },
		methods: {
            addProject(){
				this.showModel = true;
            },
            onProjectCreated(){
                this.$emit('projectedCreated');
			}
		}
    }
</script>

<style lang="less" scoped>
	.aui-header{
		div{
			display: inline-block;
		}
		.aui-i-menu{

		}
		.aui-i-action{
			float: right;
		}
	}
</style>