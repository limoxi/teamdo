<template>
	<div class="aui-header">
		<logo></logo>
		<div class="aui-i-menu">
			<Menu mode="horizontal" :theme="menuTheme" active-name="sprint">
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
					<router-link :to="{name: 'members'}">成员</router-link>
				</MenuItem>
				<MenuItem name="settings">
					<router-link to="settings">管理</router-link>
				</MenuItem>
			</Menu>
		</div>
		<theme-control></theme-control>
		<div class="aui-i-subtitle">
			<strong>{{project.name}}</strong>
		</div>
		<div class="aui-i-profile">
			<profile></profile>
		</div>
	</div>
</template>
<script>
    import Logo from '@/components/frame/block/logo';
    import Profile from '@/components/frame/block/profile';
    import ThemeControl from '@/components/frame/block/theme_control';

    export default {
        props: ['project'],
		data: function () {
		    return {
                menuTheme: localStorage.getItem('theme') || 'light'
			}
        },
        components: {
            'logo': Logo,
            'profile': Profile,
			'theme-control': ThemeControl
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
	.aui-header{
		.aui-i-subtitle{
			font-size: 16px;
		}
	}
</style>