<template>
	<Modal
		v-model="showModel"
		title="修改密码"
		:width="365"
	>
		<Form ref="form" :model="form" :rules="ruleValidate" :label-width="60">
			<FormItem label="旧密码" prop="old_pwd">
				<Input type="password" v-model="form.old_pwd" placeholder=""></Input>
			</FormItem>
			<FormItem label="新密码" prop="new_pwd">
				<Input type="password" v-model="form.new_pwd" placeholder=""></Input>
			</FormItem>
		</Form>
		<Button slot="footer" @click="confirm">确定</Button>
	</Modal>
</template>

<script>
	import Resource from '../../utils/resource';
    export default {
        props: ['show'],
		data (){
			return {
                form: {
                    old_pwd: '',
                    new_pwd: ''
                },
                ruleValidate: {
                    old_pwd: [
                        {required: true, message: '请填写当前密码', trigger: 'blur'}
                    ],
                    new_pwd: [
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
                let self = this;
                this.$refs['form'].validate((valid) => {
                    if (valid) {
                        Resource.use('iscrum').post({
							'resource': 'rust.user.password',
							'data': {
								old_pwd: this.form.old_pwd,
								new_pwd: this.form.new_pwd
							},
							'success': (data) =>{
                                self.showModel = false;
                                this.$Message.success('修改密码成功,下次登录生效');
                                this.resetForm();
							},
							'error': (resp) =>{
                                this.$Message.error(resp.errMsg);
							}
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

<style scoped>

</style>