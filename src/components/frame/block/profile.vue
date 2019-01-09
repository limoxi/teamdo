<template>
	<Dropdown style="margin-left: 20px">
		<Button type="primary">
			{{nickname}}
			<Icon type="ios-arrow-down"></Icon>
		</Button>
		<DropdownMenu slot="list">
			<DropdownItem>编辑</DropdownItem>
			<DropdownItem>退出</DropdownItem>
		</DropdownMenu>
	</Dropdown>
</template>

<script>
	import Resource from '@src/utils/resource';
    export default {
		data (){
			return {
                nickname: '测试'
			}
        },
		methods: {

		}
    }
</script>

<style scoped>

</style>