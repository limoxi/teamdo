<template>
	<div class="aui-index">
		<div class="aui-i-bg"></div>
		<login-block :show="showLogin"></login-block>
		<register-block :show="showRegister"></register-block>
		<div class="aui-i-welcome">
			<Button  type="dashed" @click="onShowLogin">登陆</Button>
			<Button  type="dashed" @click="onShowRegister">注册</Button>
		</div>
	</div>
</template>

<script>

	import LoginBlock from './login';
	import RegisterBlock from './register';

    export default {
        data(){
            return {
                showLogin: false,
				showRegister: false
			}
		},
		components: {
            'login-block': LoginBlock,
			'register-block': RegisterBlock
		},
		methods: {
            onShowLogin(){
                this.showRegister = false;
                this.showLogin = true;
			},
            onShowRegister(){
                this.showLogin = false;
                this.showRegister = true;
            }
		}
    }
</script>

<style scoped lang="less">
	.aui-index{
		.aui-i-bg{
			width: 100vw;
			height: 100vh;
			z-index: 1;
			background-image: linear-gradient(-45deg, #FFC796 0%, #FF6B95 100%);
		}
		.aui-i-welcome{
			position: fixed;
			top: 50vh;
			left: 45vw;
		}
	}
</style>