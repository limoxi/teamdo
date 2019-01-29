<template>
	<Dropdown :style="dropDownStyle" trigger="click" @on-click="onClickItem">
		<Badge dot>
			<Avatar :src="avatar" v-if="avatar" size="large"/>
			<Avatar v-else size="large">{{nickname[0]}}</Avatar>
		</Badge>

		<DropdownMenu slot="list">
			<DropdownItem name="modeProfile">编辑</DropdownItem>
			<DropdownItem name="modePwd">修改密码</DropdownItem>
			<DropdownItem name="message">消息</DropdownItem>
			<DropdownItem name="logout">退出</DropdownItem>
		</DropdownMenu>
		<password-model
			:show.sync="showPwdModel"
		></password-model>
		<user-model
			:show.sync="showUserModel"
			mode="update"
		></user-model>
	</Dropdown>
</template>

<script>
    import Cookies from 'js-cookie';
    import PasswordModel from '../../model/password_model';
    import UserModel from '@src/components/model/user_model';

    export default {
        beforeCreate(){
            let token = Cookies.get('token');
			if(!token){
			    this.$router.replace({'name': 'login'})
			}
		},

		data (){
			return {
			    showPwdModel: false,
                showUserModel: false,
			    dropDownStyle: 'margin-left: 20px;cursor: pointer;line-height:1.5',
                nickname: Cookies.get('nickname'),
				avatar: Cookies.get('avatar')
			}
        },
		components: {
            'password-model': PasswordModel,
			'user-model': UserModel,
		},
		methods: {
            onClickItem(name){
                if(name === 'modePwd'){
                    this.ShowPwdModel();
				}else if(name === 'modeProfile'){
                    this.showEditProfileModel();
				}else if(name === 'message'){
                    this.gotoMessagePage();
				}else if(name === 'logout'){
                    this.logout();
				}
			},
            ShowPwdModel(){
				this.showPwdModel = true;
			},
            showEditProfileModel(){
				this.showUserModel = true;
			},
            gotoMessagePage(){
                this.$router.push({'name': 'messages'})
			},
            logout(){
                Cookies.remove('token');
                this.$router.replace({'name': 'index'})
			}
		}
    }
</script>

<style scoped>

</style>