<template>
	<Modal
		v-model="showModel"
		title="修改密码"
		:width="365"
	>
		<Form ref="form" :model="form" :rules="ruleValidate" :label-width="70">
			<FormItem label="旧密码" prop="oldPwd">
				<Input type="password" v-model="form.oldPwd" placeholder=""></Input>
			</FormItem>
			<FormItem label="新密码" prop="newPwd">
				<Input type="password" v-model="form.newPwd" placeholder=""></Input>
			</FormItem>
		</Form>
		<Button slot="footer" @click="confirm">确定</Button>
	</Modal>
</template>

<script>
	import UserService from '@/service/user_service';
	
    export default {
        props: ['show'],
		data (){
			return {
                form: {
                    oldPwd: '',
                    newPwd: ''
                },
                ruleValidate: {
                    oldPwd: [
                        {required: true, message: '请填写当前密码', trigger: 'blur'}
                    ],
                    newPwd: [
                        {required: true, message: '新密码不能为空', trigger: 'blur'}
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
            confirm (){
                this.$refs['form'].validate((valid) => {
                    if (valid) {
                        UserService.updatePwd(this.form.oldPwd, this.form.newPwd).then(() =>{
                            this.showModel = false;
                            this.resetForm();
                            this.$Message.success('修改密码成功,下次登录生效');
						}).catch(err =>{
                            this.$Message.error(resp.errMsg);
						});
                    }
                })
			},
            cancel (){
                this.resetForm();
            },
			resetForm(){
                this.$refs['form'].resetFields();
			}
		}
    }
</script>

<style scoped lang="less">

</style>