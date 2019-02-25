<template>
	<div @click="onClickCard">
		<Card class="aui-project-card">
			<p slot="title">{{ cProject.name }}</p>
			<span class="aui-i-action" slot="extra">
				<Button size="large" type="text" icon="ios-brush" @click="onEdit"></Button>
				<Button size="large" type="text" icon="md-trash" @click="onDelete"></Button>
			</span>
			<p>{{ cProject.desc }}</p>
			<p class="aui-i-time">{{ cProject.createdAt }}</p>
		</Card>
		<project-model
			:show.sync="showModel"
			@projectUpdated="onProjectUpdated"
			:project="cProject"
		></project-model>
	</div>
</template>

<script>

	import ProjectModel from '@/components/model/project_model';
	import ProjectService from '@/service/project_service';

    export default {
        props: ['project'],
        data: function () {
            return {
                cProject: this.project,
                showModel: false,
            }
        },
		components:{
            'project-model': ProjectModel
		},
		methods: {
            onClickCard(){
                this.$router.push({
					'name': 'project',
					'params': {id: this.cProject.id, name: this.cProject.name}
				})
			},

            onEdit(e){
				e.stopPropagation();
				this.showModel = true;
			},

			onDelete(e){
                e.stopPropagation();
                this.$Modal.confirm({
                    title: '删除项目',
                    content: '<strong>确定要删除该项目么？</strong><p>删除后该项目关联的所有数据都将一并清除！！！</p>',
                    okText: '确认',
                    cancelText: '再想想',
                    onOk: () =>{
                        ProjectService.deleteProject(this.cProject.id).then(() =>{
							this.$emit('projectDeleted', this.cProject.id);
                        }).catch(err =>{
                            this.$Message.error(err.errMsg);
                        });
                    }
                });
			},

            onProjectUpdated(project){
                this.cProject = project;
			}
		}
    }
</script>

<style lang="less" scoped>
	.aui-project-card{
		&:hover{
			.aui-i-action{
				display: inline-block;
			}
		}
		cursor: pointer;

		.aui-i-time{
			text-align: right;
		}

		.ivu-card-extra{
			top: 5px;
		}

		.ivu-card-head{
			p{
				font-size: 18px;
			}
		}

		.aui-i-action{
			display: none;
			margin-top: -15px;

			.ivu-btn-icon-only.ivu-btn-large{
				font-size: 16px;
			}
		}
	}

</style>