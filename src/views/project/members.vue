<template>
	<div class="aui-project-members">
		<member-card
			:member="member"
			v-for="member in members"
			:key="member.id"
			:project="project"
			@deleteMember="onDeleteMember"
		>
		</member-card>
		<Card class="aui-add-member" v-if="isManager">
			<img :src="avatar" alt="avatar"/>
			<Button icon="md-add" @click="onAddMember" class="aui-i-add-btn">添加新成员</Button>
		</Card>
		<user-select-model
			:show.sync="showModel"
			@memberSelected="onMemberSelected"
		></user-select-model>
	</div>
</template>

<script>
	import ProjectService from '@/service/project_service';
	import MemberCard from './member_card';
    import defaultAvatar from '@/images/default-avatar.webp';
    import UserSelectModel from '@/components/model/user_select_model';
    import Cookies from 'js-cookie';
    import helper from '@/utils/helper';

    export default {
        components: {
            'member-card': MemberCard,
			'user-select-model': UserSelectModel
		},
        data(){
            return{
                projectId: ProjectService.getProjectIdFromPath(this.$route.path),
				project: null,
				members: [],
                showModel: false,
				isManager: false
			}
		},
		computed: {
            avatar(){
                return defaultAvatar;
			}
		},
        created(){
            this.getMembers();
            this.getProject();
		},
		methods: {
            onAddMember(){
				this.showModel = true;
			},
            onDeleteMember(member){
                this.$Modal.confirm({
                    title: '移除项目成员',
                    content: '<strong>确定要移除该项目成员么？</strong>',
                    okText: '确认',
                    cancelText: '再想想',
                    onOk: () =>{
                        ProjectService.deleteMembers(this.projectId, [member.id]).then(() =>{
                            helper.removeFromArray(member, this.members);
                            this.$Message.success('操作成功');
                        }).catch(err =>{
                            this.$Message.error(err.errMsg);
                        });
                    }
                });
			},
			onMemberSelected(ids){
                ProjectService.addMembers(this.projectId, ids).then(() =>{
                    this.$Message.success('添加成员成功，正在刷新...');
                    this.getMembers();
                }).catch(err =>{
                    this.$Message.error(err.Msg);
                })
			},
			getMembers(){
                ProjectService.getProjectMembers(this.projectId).then(data =>{
                    this.members = data;
                }).catch(err =>{
                    this.$Message.error(err.errMsg);
                });
			},
            getProject(){
                ProjectService.getProject(this.projectId).then(data =>{
                    this.project = data;
                    this.isManager = this.project.manager_id == Cookies.get('uid');
				}).catch(err =>{
				    this.$Message.error(err.Msg);
				})
			},
		}
    }
</script>

<style lang="less" scoped>
	.aui-project-members{
		display: flex;
		flex-wrap: wrap;
		margin: 15px;
	}
	.aui-add-member{
		text-align: center;
		width: 150px;
		margin-left: 5px;

		img{
			width: 80px;
			border-radius: 50px;
			background-image: linear-gradient(-225deg, #69EACB 0%, #EACCF8 48%, #6654F1 100%);
		}

		.aui-i-add-btn{
			margin-top: 10px;
		}
	}
</style>