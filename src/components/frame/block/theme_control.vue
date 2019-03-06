<template>
	<div @click="onToggleTheme" :class="klass">
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
            klass(){
                return this.curTheme;
			},
			desc(){
                return this.curTheme === 'light'? '关灯': '开灯';
			}
		}
    }
</script>

<style scoped lang="less">
	div{
		cursor: pointer;
		&:hover{
			transform: scale(1.1);
		}
	}
	.light{
		color: black;
	}
	.dark{
		color: white;
	}
	.ivu-icon:before{
		font-size: 12px;
		vertical-align: super;
	}
</style>