<template slot="footer">
	<footer class="aui-footer">
		<a href="https://github.com/limoxi" target="_blank">
			<Icon class="aui-i-github" type="logo-github" />&nbsp;&nbsp;Developed By Aix</a>
	</footer>
</template>
<script>
    export default {

    }
</script>

<style lang="less">
	.aui-footer{
		position: fixed;
		bottom: 0;
		width: 100vw;
		text-align: center;

		a{
			text-decoration: none;
			outline: none;
			color: inherit;

			.aui-i-github{
				font-size: 24px;
			}
		}

	}

</style>