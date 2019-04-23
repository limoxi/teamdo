<template>
	<Modal
		v-model="showModel"
		title="用户列表"
		width="520"
		@on-ok="onConfirmed"
	>
		<Transfer
			:data="allUsers"
			:target-keys="selectedIds"
			:list-style="listStyle"
			:render-format="render"
			:titles="['所有用户', '已选择用户']"
			:operations="['删除','添加']"
			filterable
			filter-placeholder="昵称搜索"
			@on-change="onSelect"
		>
		</Transfer>
	</Modal>
</template>
<script>
	import UserService from '@/service/user_service';
	import ProjectService from '@/service/project_service';

    export default {
        props: ['show', 'singleSelect', 'projectId', 'forProject', 'filters'],
        data () {
            return {
                allUsers: [],
                selectedIds: [],
                listStyle: {
                    width: '200px',
					height: '200px'
				},
            }
        },
        computed: {
            showModel: {
                get(){
                    if(this.show){
                        this.resourceFunc(this.projectId, this.filters).then(data =>{
                            this.allUsers = data.users.map(user =>{
                                if(user.group){
                                    user.role = user.group.name;
								}else{
                                    user.role = user.role_text;
								}
                                user.key = user.id;
                                user.label = user.nickname;
                                user.disabled = false;
                                return user;
                            });
                        }).catch(err =>{
                            this.$Message.error(err.Msg);
                        });
					}
                    return this.show;
                },
                set(newValue){
                    this.$emit('update:show', newValue);
                }
            },
			resourceFunc(){
                if(this.forProject){
                    return ProjectService.getProjectMembers;
				}else{
                    return UserService.getAllUsers;
				}
			}
        },
        methods: {
            render(user){
				return `${user.nickname}-${user.role}`;
			},
            onSelect(ids){
                if(this.singleSelect){
                    if(ids.length > 1){
                        this.$Message.warning('只能选择一个');
                        return;
					}
				}
                this.selectedIds = ids;
			},
            onConfirmed(){
                let data = this.singleSelect? (this.selectedIds.length===0?null:this.selectedIds[0]): this.selectedIds;
                this.$emit('memberSelected', data);
                this.selectedIds = [];
				this.allUsers = [];
			}
        }
    }
</script>

<style scoped lang="less">

</style>