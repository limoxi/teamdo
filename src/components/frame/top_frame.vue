<template>
	<div class="layout">
		<Layout>
			<header-block></header-block>
			<Content class="aui-content">
				<slot></slot>
			</Content>
			<footer-block></footer-block>
		</Layout>
	</div>
</template>

<script>
	import HeaderBlock from './block/header.vue';
	import FooterBlock from './block/footer.vue';
    export default {
        components: {
            HeaderBlock,
            FooterBlock
		}
    }
</script>

<style lang="less" scoped>
	.aui-content{
		min-height: 100vh;
	}
</style>