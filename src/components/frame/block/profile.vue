<template>
	<Dropdown style="margin-left: 20px">
		<Button type="primary">
			{{nickname}}
			<Icon type="ios-arrow-down"></Icon>
		</Button>
		<DropdownMenu slot="list">
			<DropdownItem>编辑</DropdownItem>
			<DropdownItem>修改密码</DropdownItem>
			<DropdownItem>退出</DropdownItem>
		</DropdownMenu>
	</Dropdown>
</template>

<script>
    import Cookies from 'js-cookie';

    export default {
        beforeCreate(){
            let token = Cookies.get('token');
			if(!token){
			    this.$router.replace({'name': 'login'})
			}
		},

		data (){
			return {
                nickname: Cookies.get('nickname'),
				avatar: Cookies.get('avatar')
			}
        },
		methods: {

		}
    }
</script>

<style scoped>

</style>