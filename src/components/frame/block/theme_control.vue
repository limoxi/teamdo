<template>
	<div @click="onToggleTheme" :class="clss">
		{{desc}}<Icon :type="btnType" />
	</div>
</template>

<script>
    export default {
        data(){
          	return {
          	    curTheme: window.localStorage.getItem('theme') || 'light'
			}
		},
        methods: {
            onToggleTheme(){
                if(this.curTheme === 'light'){
                    this.curTheme = 'dark';
				}else{
                    this.curTheme = 'light';
				}
                window.localStorage.setItem('theme', this.curTheme);
                window.EventBus.$emit('themeChanged', this.curTheme);
			}
		},
		computed: {
            btnType(){
                return this.curTheme === 'light'? 'md-moon': 'md-sunny';
			},
            clss(){
                return this.curTheme;
			},
			desc(){
                return this.curTheme === 'light'? '关灯': '开灯';
			}
		}
    }
</script>

<style scoped>
	div{
		cursor: pointer;
	}
	.light{
		color: black;
	}
	.dark{
		color: white;
	}
	.ivu-icon-md-moon:before{
		font-size: 20px;
		vertical-align: baseline;
	}
</style>