<template>
	<div class="aui-header">
		<logo></logo>
		<div class="aui-i-menu"></div>
		<theme-control></theme-control>
		<div class="aui-i-action">
			<Button type="primary" icon="md-add" @click="addProject" class="aui-icon-scale">添加项目</Button>
			<profile></profile>
		</div>
		<project-model
			mode="create"
			:show.sync="showModel"
			@projectCreated="onProjectCreated"
		></project-model>
	</div>
</template>
<script>
    import ProjectModel from '@/components/model/project_model';
    import Logo from '@/components/frame/block/logo';
    import Profile from '@/components/frame/block/profile';
    import ThemeControl from '@/components/frame/block/theme_control';

    export default {
		data: function () {
		    return {
                showModel: false,
			}
        },
        components: {
            'project-model': ProjectModel,
			'logo': Logo,
			'profile': Profile,
            'theme-control': ThemeControl
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

</style>