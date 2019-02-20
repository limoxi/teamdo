<template>
	<div class="aui-kanban-header">
		<div class="aui-i-title">操作</div>
		<div>
			<Button>添加泳道</Button>
		</div>
	</div>
</template>

<script>
    export default {
        data(){
            return {
			}
		},
		components: {
		}
    }
</script>

<style lang="less" scoped>
	.aui-kanban-header{
		display: flex;
		justify-content: flex-start;
		padding: 0 80px;

		div{
			margin: 0 10px;
		}

		.aui-i-title{
			font-size: 20px;
		}
	}
</style>