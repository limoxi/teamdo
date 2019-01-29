<template>
	<div class="aui-index">
		<div class="aui-i-bg"></div>
		<div class="aui-i-welcome">
			<logo-svg></logo-svg>
			<br>
			<strong>不嘈不杂，</strong>
			<strong>专注项目，</strong>
			<strong>迅猛敏捷！</strong>
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
			mode="register"></user-model>
	</div>
</template>

<script>

	import LoginModel from '../components/model/login_model';
	import UserModel from '../components/model/user_model';
	import LogoSvg from './logo_svg';
	import Cookies from 'js-cookie';

    export default {
        data(){
            return {
                showLogin: false,
				showRegister: false
			}
		},
		components: {
            'login-model': LoginModel,
			'user-model': UserModel,
			'logo-svg': LogoSvg
		},
		computed: {
            showEntry(){
                return !!Cookies.get('token')
			},
			hideEntry(){
                return !Cookies.get('token');
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
		text-align: center;
		.aui-i-bg{
			position: fixed;
			width: 100vw;
			height: 100vh;
			z-index: 1;
			background-image: linear-gradient(-45deg, #FFC796 0%, #FF6B95 100%);
		}
		.aui-i-welcome{
			position: relative;
			top: 20vh;
			z-index: 2;

			strong{
				font-size: 30px;
			}

			.aui-i-action{
				margin-top:40px;
				font-size: 22px;
				text-align: center;
			}
		}
	}
</style>