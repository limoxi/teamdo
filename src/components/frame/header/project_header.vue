<template>
	<Header class="aui-project-header">
		<logo></logo>
		<div class="aui-i-menu">
			<Menu mode="horizontal" theme="dark" active-name="sprint">
				<MenuItem name="projects">
					<router-link :to="{name: 'projects'}">项目</router-link>
				</MenuItem>
				<MenuItem name="sprint">
					<router-link :to="{name: 'sprint'}">迭代</router-link>
				</MenuItem>
				<MenuItem name="kanban">
					<router-link to="kanban">看板</router-link>
				</MenuItem>
				<MenuItem name="demands">
					<router-link to="demands">需求</router-link>
				</MenuItem>
				<MenuItem name="bugs">
					<router-link to="bugs">BUG</router-link>
				</MenuItem>
				<MenuItem name="state">
					<router-link to="state">统计</router-link>
				</MenuItem>
				<MenuItem name="members">
					<router-link to="members">成员</router-link>
				</MenuItem>
				<MenuItem name="settings">
					<router-link to="settings">管理</router-link>
				</MenuItem>
			</Menu>
		</div>
		<div class="aui-i-profile">
			<profile></profile>
		</div>
	</Header>
</template>
<script>
    import Logo from '@src/components/frame/block/logo';
    import Profile from '@src/components/frame/block/profile';

    export default {
		data: function () {
		    return {
			}
        },
        components: {
            'logo': Logo,
            'profile': Profile
        },
		methods: {
            onClickLogo(){
                this.$router.push({
					'name': 'index'
				});
                console.log('logo clicked');
			}
		}
    }
</script>

<style lang="less" scoped>
	.aui-project-header{
		div{
			display: inline-block;
		}
		.aui-i-menu{

		}
		.aui-i-profile{
			float: right;
		}
	}
</style>