<template>
	<div>
		<Card>
			<p slot="title">{{ project.name }}</p>
			<p>{{ project.desc }}</p>
			<p>{{ project.createdAt }}</p>
		</Card>
	</div>
</template>

<script>
    export default {
        props: ['project']
    }
</script>

<style lang="less" scoped>

</style>