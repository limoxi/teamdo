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
	import ProjectService from '@src/service/project_service';
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
						ProjectService.createProject(
							this.form.name,
							this.form.desc
						).then(() =>{
							this.$Message.success('成功创建新项目');
							this.resetForm();
							this.$emit('projectCreated');
						}).catch(err =>{
							this.$Message.error(err.errMsg);
						});
                    } else {
                        this.$Message.error('请检查填写项！');
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