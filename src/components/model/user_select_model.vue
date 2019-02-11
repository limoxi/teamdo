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

    export default {
        props: ['show'],
        data () {
            return {
                allUsers: [],
                selectedIds: [],
                listStyle: {
                    width: '200px',
					height: '200px'
				}
            }
        },
        computed: {
            showModel: {
                get(){
                    if(this.show){
                        UserService.getAllUsers().then(data =>{
                            this.allUsers = data.users.map(user =>{
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
            }
        },
        methods: {
            render(user){
				return `${user.nickname}-${user.group.name}`;
			},
            onSelect(ids){
                this.selectedIds = ids;
			},
            onConfirmed(){
                this.$emit('memberSelected', this.selectedIds);
			}
        }
    }
</script>

<style scoped lang="less">

</style>