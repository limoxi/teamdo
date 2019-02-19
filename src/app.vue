<style lang="less">
	@import 'styles/common.less';
</style>
<template>
	<div :class="theme">
		<router-view></router-view>
	</div>
</template>
<script>
    export default {
        data () {
            return {
                theme: `aui-theme-${localStorage.getItem("theme") || 'light'}`
			}
        },
        mounted () {
            window.EventBus.$on('themeChanged', newTheme =>{
                this.theme = `aui-theme-${newTheme}`;
			})
        },
        beforeDestroy () {
        },
        methods: {
        }
    }
</script>