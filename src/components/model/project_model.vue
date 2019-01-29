<template>
	<Modal
		v-model="showModel"
		title="创建项目"
		@on-ok="confirm"
		@on-cancel="cancel"
	>
		<Form ref="form" :model="form" :rules="ruleValidate" :label-width="80">
			<FormItem label="项目名" prop="name">
				<Input v-model="form.name" placeholder=""></Input>
			</FormItem>
			<FormItem label="简介" prop="desc">
				<Input v-model="form.desc" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="项目简要描述"></Input>
			</FormItem>
		</Form>

	</Modal>
</template>

<script>
	import Resource from '../../utils/resource';
    export default {
        props: ['show'],
		data (){
			return {
                form: {
                    name: '',
                    desc: ''
                },
                ruleValidate: {
                    name: [
                        {required: true, message: '项目名不能为空', trigger: 'blur'}
                    ],
                    desc: [
                        {required: true, message: '简要描述一下这个项目吧', trigger: 'blur'}
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
                        Resource.use('iscrum').put({
							'resource': 'project.project',
							'data': {
                                __dev_uid: 1,
								name: this.form.name,
								desc: this.form.desc
							},
							'error': (resp) =>{
							    console.warn(resp);
							}
						});
                        this.$Message.success('成功创建新项目');
						this.resetForm();
                    } else {
                        this.$Message.error('请检查填写项！');
                    }
                })
			},
            cancel (){
                this.resetForm();
				this.$Message.info('放弃添加新项目');
            },
			resetForm(){
                this.$refs['form'].resetFields();
			}
		}
    }
</script>

<style scoped>

</style>