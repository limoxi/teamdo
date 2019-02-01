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

	import UserService from '@src/service/user_service';
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
                        UserService.doLogin(
                            self.loginUser.username,
							self.loginUser.password,
							()=>{
                                self.showModel = false;
                                self.resetForm();
                                self.$router.replace({name: 'projects'});
							},
                            (resp) =>{
                                self.$Message.error(resp.errMsg);
                            }
						);
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