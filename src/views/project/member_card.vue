<template>
	<Card class="aui-member-card">
		<Button
			type="text" icon="md-close" slot="extra"
			class="aui-i-extra-btn"
			v-if="showDeleteBtn"
			@click="onDelete"
		></Button>
		<img :src="avatar" alt="avatar"/>
		<div class="aui-i-desc">
			<p>{{member.nickname}}</p>
			<p>{{member.role_text}}</p>
		</div>
	</Card>
</template>

<script>

	import defaultAvatar from '@/images/default-avatar.webp';

    export default {
        props: ['member', 'showDelete'],
        data(){
            return {
                showDeleteBtn: this.showDelete
			}
		},
		computed: {
            avatar(){
                return this.member.avatar || defaultAvatar;
			}
		},
		methods: {
            onDelete(){
                this.$emit('deleteMember', this.member);
			}
		}
    }
</script>

<style lang="less">
	.aui-member-card{
		width: 150px;
		margin-left: 5px;
		text-align: center;
		img{
			width: 80px;
		}
		.aui-i-hr{
			border-bottom: 1px dashed grey;
		}
		.ivu-card-extra{
			top: 0;
			right: 0;

			.aui-i-extra-btn{
				font-size: 20px;
			}
		}

	}
</style>