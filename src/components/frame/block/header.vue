<template>
	<Header class="aui-header">
		<div class="aui-i-logo" @click="onClickLogo">
			<strong>iScrum</strong>
		</div>
		<div class="aui-i-menu">
			<span>项目</span>
		</div>
		<div class="aui-i-action">
			<Button type="primary" icon="md-add" @click="addProject">添加项目</Button>
			<Dropdown style="margin-left: 20px">
				<Button type="primary">
					{{nickname}}
					<Icon type="ios-arrow-down"></Icon>
				</Button>
				<DropdownMenu slot="list">
					<DropdownItem>编辑</DropdownItem>
					<DropdownItem>退出</DropdownItem>
				</DropdownMenu>
			</Dropdown>
		</div>

		<new-project-model
			:show.sync="showModel"
		></new-project-model>
	</Header>
</template>
<script>
    import NewProjectModel from './blank_project_model.vue';
    export default {
		data: function () {
		    return {
                nickname: '测试',
                showModel: false
			}
        },
        components: {
            'new-project-model': NewProjectModel
        },
		methods: {
            addProject(){
				this.showModel = true;
            },
            onClickLogo(){
			}
		}
    }
</script>

<style lang="less" scoped>
	.aui-header{
		div{
			display: inline-block;
		}
		.aui-i-logo{
			font-size: 28px;
			color: azure;
			font-family: "Comic Sans MS",sans-serif;
		}
		.aui-i-menu{

		}
		.aui-i-action{
			float: right;
		}
	}
</style>