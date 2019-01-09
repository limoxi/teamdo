<template>
	<div @click="onClickCard">
		<Card class="aui-project-card">
			<p slot="title">{{ project.name }}</p>
			<p>{{ project.desc }}</p>
			<p class="aui-i-time">{{ project.createdAt }}</p>
		</Card>
	</div>
</template>

<script>
    export default {
        props: ['project'],
		methods: {
            onClickCard(){
                this.$router.push({
					'name': 'project',
					'params': {id: this.project.id}
				})
			}
		}
    }
</script>

<style lang="less" scoped>
	.aui-project-card{
		cursor: pointer;

		.aui-i-time{
			text-align: right;
		}
	}

</style>