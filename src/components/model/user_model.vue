<template>
	<Modal
		v-model="showModel"
		:title="title"
		width="450"
	>
		<Form ref="form" :model="user" :rules="ruleValidate" :label-width="80">
			<!--<FormItem label="头像" prop="avatar">-->
				<!--<uploader-->
					<!--ref="upload"-->
				<!--&gt;-->
					<!--<div style="width: 58px;height:58px;line-height: 58px;">-->
						<!--<Icon type="ios-camera" size="20"></Icon>-->
					<!--</div>-->
				<!--</uploader>-->
			<!--</FormItem>-->
			<FormItem label="登录名" prop="username" v-if="!isUpdateMode">
				<Input v-model="user.username" placeholder=""></Input>
			</FormItem>
			<FormItem label="昵称" prop="nickname">
				<Input v-model="user.nickname" placeholder=""></Input>
			</FormItem>
			<FormItem label="密码" prop="password" v-if="isRegisterMode">
				<Input type="password" v-model="user.password"></Input>
			</FormItem>
			<FormItem>
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
	// import Uploader from '@src/components/uploader';
	import UserService from '@src/service/user_service';
	import PermissionService from '@src/service/permission_service';

    export default {
		components: {
            // 'uploader': Uploader
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
                    let self = this;
                    if(this.show){
                        if(this.isUpdateMode){
                            UserService.getUser({
								data: {
                                    user_id: Cookie.get('uid'),
                                    with_options: JSON.stringify({
                                        'with_group_info': true
                                    })
								},
                                success: (data) =>{
                                    self.roleId = data.group.id;
                                    self.user.username = data.username;
                                    self.user.avatar = data.avatar;
                                    self.user.nickname = data.nickname;
                                }
							})
						}
                        PermissionService.getAllGroups((data)=>{
                            self.roles = data;
						}, (resp)=>{
                            console.log(resp);
						})
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
                                username: self.user.username,
                                password: self.user.password,
                                nickname: self.user.nickname,
                                group_id: self.roleId
                            }, (data) =>{
                                this.$Message.success('注册成功,可以登录了~');
                                this.$emit('update:registered', true);
                                self.showModel = false;
                            }, (resp) =>{
                                this.$Message.error(resp.errMsg || '网络故障');
                            });
						}

                        if(self.isUpdateMode){
                            UserService.updateUser({
                                nickname: self.user.nickname,
                                group_id: self.roleId
                            }, (data) =>{
                                self.showModel = false;
                            }, (resp) =>{
                                this.$Message.error(resp.errMsg || '网络故障');
                            });
						}
                    }
                })
            },
            resetForm(){
                this.$refs['form'].resetFields();
            }
        }
    }
</script>
