<template>
	<div class="aui-logo" @click="onClickLogo">
		TeamDo
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
            }
        }
    }
</script>

<style scoped lang="less">
	.aui-logo{
		font-family: teamdo;
		font-size: 32px;
		cursor: pointer;
	}
</style>