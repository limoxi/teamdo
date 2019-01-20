<template>
	<div class="aui-logo" @click="onClickLogo">
		<strong>TeamDo</strong>
	</div>
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
		vertical-align: text-bottom;
		line-height: 66px;
		margin-right: 35px;
		cursor: pointer;
		font-size: 28px;
		color: azure;
		font-family: "Comic Sans MS",sans-serif;

		.aui-i-d{
			font-size: 18px;
		}
	}
</style>