<template>
	<div class="aui-logo" @click="onClickLogo"></div>
</template>

<script>
    export default {
		data (){
			return {}
        },
		methods: {
            onClickLogo(){
                this.$router.push({
                    'name': 'index'
                });
                console.log('logo clicked');
            }
        }
    }
</script>

<style scoped lang="less">
	.aui-logo{
		height: 58px;
		width: 140px;
		margin-top: 10px;
		margin-left: -50px;
		cursor: pointer;
		background-image: url("../../../images/logo-mini.png");
	}
</style>