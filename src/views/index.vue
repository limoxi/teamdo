<template>
	<div class="aui-index">
		<div class="aui-i-bg"></div>
		<div class="aui-i-welcome">
			<div class="aui-i-logo">TeamDo</div>
			<div>
				<strong>不嘈不杂，</strong>
				<strong>专注项目，</strong>
				<strong>迅猛敏捷！</strong>
			</div>
			<div class="aui-i-action">
				<Button type="text" @click="onShowLogin" v-if="hideEntry">登陆</Button>
				<Button type="text" @click="onShowRegister" v-if="hideEntry">注册</Button>
				<Button type="text" :to='{name: "projects"}' v-if="showEntry">项目列表</Button>
			</div>
		</div>
		<login-model :show.sync="showLogin"></login-model>
		<user-model
			:show.sync="showRegister"
			:registered.sync="showLogin"
			mode="register">
		</user-model>
	</div>
</template>

<script>

	import LoginModel from '../components/model/login_model';
	import UserModel from '../components/model/user_model';
	import helper from '@/utils/helper';

    export default {
        data(){
            return {
                showLogin: false,
				showRegister: false
			}
		},
		components: {
            'login-model': LoginModel,
			'user-model': UserModel
		},
		computed: {
            showEntry(){
                return !!helper.storage.get('token')
			},
			hideEntry(){
                return !helper.storage.get('token');
			}
		},
		methods: {
            onShowLogin(){
                this.showRegister = false;
                this.showLogin = true;
			},
            onShowRegister(){
                this.showLogin = false;
                this.showRegister = true;
            },
            onRegistered(){
                this.showLogin = true;
			}
		}
    }
</script>

<style scoped lang="less">
	.aui-index{
		.aui-i-bg{
			position: fixed;
			width: 100vw;
			height: 100vh;
			filter: blur(2px);
			/*background-image: linear-gradient(-45deg, #FFC796 0%, #FF6B95 100%);*/
			background-image: url("../images/index-bg.svg");
			background-position: center center;
			background-repeat: no-repeat;
			background-size: cover;
		}
		.aui-i-welcome{
			position: absolute;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			width: 100vw;
			height: 75vh;

			strong{
				font-size: 30px;
			}

			.aui-i-logo{
				font-size: 90px;
				font-family: teamdo;
				margin-bottom: 15px;
			}

			.aui-i-action{
				margin-top:20px;
				font-size: 26px;
			}
		}
	}
</style>