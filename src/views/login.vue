<template>
	<div class="aui-login" v-if="show">
		<Card>
			<p slot="title">登陆</p>
			<Form ref="form" :model="loginUser" :rules="ruleValidate" :label-width="80">
				<FormItem label="登录名" prop="username">
					<Input v-model="loginUser.username" placeholder=""></Input>
				</FormItem>
				<FormItem label="密码" prop="password">
					<Input type="password" v-model="loginUser.password"></Input>
				</FormItem>
				<FormItem>
					<Button type="primary" @click="handleSubmit">登陆</Button>
					<Button @click="handleRegister" style="margin-left: 8px">注册</Button>
				</FormItem>
			</Form>
		</Card>
	</div>
</template>
<script>

	import Resource from '@src/utils/resource';
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
        methods: {
            handleSubmit() {
                this.$refs['form'].validate((valid) => {
                    if (valid) {
                        Resource.use('iscrum').put({
							'resource': 'rust.user.logined_user',
							'data': {
							    'username': this.loginUser.username,
								'password': this.loginUser.password
							},
							'success': (data) =>{
							    console.log(data);
                                Cookies.set('token', data['token']);
                                Cookies.set('nickname', data.nickname);
                                Cookies.set('avatar', data.avatar);
                                this.$router.replace({name: 'projects'})
                            },
							error: (resp) =>{
                                this.$Message.error(resp.errMsg);
							}
						})
                    } else {
                        this.$Message.error('校验失败');
                    }
                })
            },
            handleRegister() {
                this.$router.replace({'name': 'register'});
            }
        }
    }
</script>

<style scoped lang="less">
	.aui-login{
		width: 345px;
		position: fixed;
		right: 20%;
		top: 35%;
		z-index: 2;
	}
</style>