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

	import Resource from '../../utils/resource';
	import Cookie from 'js-cookie';
	// import Uploader from '@src/components/uploader';

    export default {
        created(){
            if(this.isUpdateMode){
                Resource.use('iscrum').get({
                    'resource': 'rust.user.user',
                    'data': {
                        user_id: Cookie.get('user_id'),
						with_options: JSON.stringify({
							'with_group_info': true
						})
                    },
					success: (data) =>{
                        this.roleId = data.group.id;
						this.user.username = data.username;
						this.user.avatar = data.avatar;
						this.user.nickname = data.nickname;
					}
                });
			}
		},
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
                    if(this.show){
                        Resource.use('iscrum').get({
                            'resource': 'rust.permission.groups',
                            'data': {},
                            'success': (data) =>{
                                this.roles = data;
                            },
                            'error': (resp) =>{
                                console.log(resp);
                            }
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
                            Resource.use('iscrum').put({
								'resource': 'rust.user.registered_user',
								'data': {
                                    username: self.user.username,
                                    password: self.user.password,
                                    nickname: self.user.nickname,
                                    group_id: self.roleId
								},
								success: (data) =>{
                                    this.$Message.success('注册成功,可以登录了~');
                                    this.$emit('update:registered', true);
                                    self.showModel = false;
								},
								error: (resp) =>{
                                    this.$Message.error(resp.errMsg || '网络故障');
								}
							})
						}

                        if(self.isUpdateMode){
                            Resource.use('iscrum').post({
								'resource': 'rust.user.user',
								'data': {
									nickname: self.user.nickname,
                                    group_id: self.roleId
								},
                                success: (data) =>{
                                    console.log(data);
                                    self.showModel = false;
                                },
                                error: (resp) =>{
                                    this.$Message.error(resp.errMsg || '网络故障');
                                }
							})
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
