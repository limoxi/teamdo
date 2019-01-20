<template>
	<Modal
		v-model="showModel"
		title="注册"
		@on-ok="handleSubmit"
		@on-cancel="cancel"
		width="450"
	>
		<Form ref="registerForm" :model="register" :rules="ruleValidate" :label-width="80">
			<FormItem label="头像" prop="avatar">
				<!--<uploader-->
					<!--ref="upload"-->
				<!--&gt;-->
					<!--<div style="width: 58px;height:58px;line-height: 58px;">-->
						<!--<Icon type="ios-camera" size="20"></Icon>-->
					<!--</div>-->
				<!--</uploader>-->
			</FormItem>
			<FormItem label="登录名" prop="username">
				<Input v-model="register.username" placeholder=""></Input>
			</FormItem>
			<FormItem label="昵称" prop="nickname">
				<Input v-model="register.nickname" placeholder=""></Input>
			</FormItem>
			<FormItem label="密码" prop="password">
				<Input type="password" v-model="register.password"></Input>
			</FormItem>
			<FormItem>
				<Select v-model="roleId" style="width:200px" :clearable="true" label="请选择职位">
					<Option v-for="role in roles" :value="role.id" :key="role.id">{{ role.desc }}</Option>
				</Select>
			</FormItem>
		</Form>
	</Modal>

</template>
<script>

	import Resource from '@src/utils/resource';
	// import Uploader from '@src/components/uploader';

    export default {
        created(){
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
		},
		components: {
            // 'uploader': Uploader
		},
        props: ['show'],
        data () {
            return {
                roles: [],
                roleId: 0,
                register: {
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
            handleSubmit () {
                this.$refs['registerForm'].validate((valid) => {
                    if (valid) {
                        this.$Message.success('Success!');
                    }
                })
            },
            cancel(){
                this.resetForm();
			},
            resetForm(){
                this.$refs['registerForm'].resetFields();
            }
        }
    }
</script>
