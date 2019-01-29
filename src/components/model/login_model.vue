<template>
	<Modal
		v-model="showModel"
		title="登陆"
		width="360"
	>
		<Form ref="loginForm" :model="loginUser" :rules="ruleValidate" :label-width="80">
			<FormItem label="登录名" prop="username">
				<Input v-model="loginUser.username" placeholder=""></Input>
			</FormItem>
			<FormItem label="密码" prop="password">
				<Input type="password" v-model="loginUser.password"></Input>
			</FormItem>
		</Form>
		<Button slot="footer" @click="handleSubmit">确定</Button>
	</Modal>
</template>
<script>

	import Resource from '../../utils/resource';
    import Cookies from 'js-cookie';
    export default {
        props: ['show'],
        data () {
            return {
                loginUser: {
                    username: '',
                    password: ''
                },
                ruleValidate: {
                    username: [
                        { required: true, message: '登陆名不能为空', trigger: 'blur' }
                    ],
                    password: [
                        { required: true, message: '密码不能为空', trigger: 'blur' }
                    ]
                }
            }
        },
        computed: {
            showModel: {
                get(){
                    return this.show;
                },
                set(newValue){
                    this.$emit('update:show', newValue);
                }
            }
        },
        methods: {
            handleSubmit() {
                let self = this;
                this.$refs['loginForm'].validate((valid) => {
                    if (valid) {
                        Resource.use('iscrum').put({
							'resource': 'rust.user.logined_user',
							'data': {
							    'username': this.loginUser.username,
								'password': this.loginUser.password
							},
							'success': (data) =>{
							    self.showModel = false;
                                self.resetForm();
                                Cookies.set('token', data['token']);
                                Cookies.set('nickname', data.nickname);
                                Cookies.set('avatar', data.avatar);
                                self.$router.replace({name: 'projects'})
                            },
							error: (resp) =>{
                                self.$Message.error(resp.errMsg);
							}
						})
                    }
                })
            },
            resetForm(){
                this.$refs['loginForm'].resetFields();
            }
        }
    }
</script>

<style scoped lang="less">

</style>