<template>
	<Modal
		v-model="showModel"
		:title="title"
		width="365"
	>
		<Form ref="form" :model="user" :rules="ruleValidate" :label-width="80">
			<FormItem label="" prop="avatar" style="margin-left:43px;">
				<uploader
					ref="upload"
					:src.sync="user.avatar"
				>
				</uploader>
			</FormItem>
			<FormItem label="登录名" prop="username" v-if="!isUpdateMode">
				<Input v-model="user.username" placeholder=""></Input>
			</FormItem>
			<FormItem label="昵称" prop="nickname">
				<Input v-model="user.nickname" placeholder="" style="width:200px"></Input>
			</FormItem>
			<FormItem label="密码" prop="password" v-if="isRegisterMode">
				<Input type="password" v-model="user.password"></Input>
			</FormItem>
			<FormItem label="职位">
				<Select v-model="roleId" style="width:200px" :clearable="true" label="请选择职位">
					<Option v-for="role in roles" :value="role.id" :key="role.id">{{ role.name }}</Option>
				</Select>
			</FormItem>
		</Form>
		<Button slot="footer" @click="handleSubmit">确定</Button>
	</Modal>
</template>
<script>

	import Cookie from 'js-cookie';
	import Uploader from '@/components/uploader';
	import UserService from '@/service/user_service';
	import PermissionService from '@/service/permission_service';
    import events from '@/service/global_events';

    export default {
		components: {
            'uploader': Uploader
		},
        props: ['show', 'mode'],
        data () {
            return {
                roles: [],
                roleId: 0,
                user: {
                    username: '',
                    nickname: '',
                    avatar: '',
                    password: '',

                },
                ruleValidate: {
                    username: [
                        { required: true, message: '你需要一个登陆账号', trigger: 'blur' }
                    ],
                    password: [
                        { required: true, message: '请输入密码', trigger: 'blur' }
                    ],
                    roleId: [
                        { required: true, message: '请选择职位', trigger: 'change' }
                    ]
                }
            }
        },
        computed: {
            title(){
                return this.isRegisterMode? '注册': '编辑';
			},
            showModel: {
                get(){
                    if(this.show){
                        if(this.isUpdateMode){
							UserService.getUser({
								user_id: Cookie.get('uid'),
								with_options: JSON.stringify({
									'with_group_info': true
								})
							}).then(data =>{
								this.roleId = data.group.id;
								this.user.username = data.username;
								this.user.avatar = data.avatar;
								this.user.nickname = data.nickname;
							}).catch (err =>{
								this.$Message.error('获取用户信息失败');
							});
						}
						PermissionService.getAllGroups().then(data =>{
				 			this.roles = data;
						}).catch(err =>{
							this.$Message.error('获取角色列表失败');
					 	});
					}
                    return this.show;
                },
                set(newValue){
                    this.$emit('update:show', newValue);
                }
            },
			isRegisterMode(){
                return this.mode === 'register';
			},
			isUpdateMode(){
                return this.mode === 'update';
			}
        },
        methods: {
            handleSubmit () {
                let self = this;
                this.$refs['form'].validate((valid) => {
                    if (valid) {
                        if(self.isRegisterMode){
							UserService.doRegister({
								username: this.user.username,
								avatar: this.user.avatar,
								password: this.user.password,
								nickname: this.user.nickname,
								group_id: this.roleId
							}).then(() =>{
								this.$Message.success('注册成功,可以登录了~');
								this.$emit('update:registered', true);
								this.showModel = false;
							}).catch(err =>{
								this.$Message.error(err.errMsg);
							});
						}

                        if(self.isUpdateMode){
							UserService.updateUser({
                                avatar: this.user.avatar,
								nickname: this.user.nickname,
								group_id: this.roleId
							}).then(() =>{
                                window.EventBus.$emit(events.USER_UPDATED, this.user);
								this.showModel = false;
                                this.$Message.success('修改信息成功~');
							}).catch(err =>{
								this.$Message.error(err.errMsg);
							});
						}
                    }
                });
            },
            resetForm(){
                this.$refs['form'].resetFields();
            }
        }
    }
</script>
