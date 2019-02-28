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
			});
        },
		created(){

		},
        beforeDestroy () {
        },
        methods: {

        }
    }
</script>
<style lang="less">
	@import 'styles/common.less';
</style>