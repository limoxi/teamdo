<template>
	<Dropdown :style="dropDownStyle" trigger="click">
		<Badge dot>
			<Avatar :src="avatar" v-if="avatar" size="large"/>
			<Avatar v-else size="large">{{nickname[0]}}</Avatar>
		</Badge>

		<DropdownMenu slot="list">
			<DropdownItem>编辑</DropdownItem>
			<DropdownItem>修改密码</DropdownItem>
			<DropdownItem>消息</DropdownItem>
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
			    dropDownStyle: 'margin-left: 20px;cursor: pointer;line-height:1.5',
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