<template>
	<div class="layout">
		<Layout>
			<slot name="header"></slot>
			<Content class="aui-content">
				<slot name="content"></slot>
			</Content>
			<footer-block></footer-block>
		</Layout>
	</div>
</template>

<script>
	import HeaderBlock from './header/header.vue';
	import FooterBlock from './footer/footer.vue';
    export default {
        components: {
            FooterBlock
		}
    }
</script>

<style lang="less" scoped>
	.aui-content{
		min-height: 100vh;
	}
</style>