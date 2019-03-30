<template>
	<div class="aui-project-settings">
		<Divider orientation="left">标签</Divider>
		<div class="aui-i-tags">
			<Tag v-for="tag in settings.tags" :key="tag" :name="tag" closable @on-close="onDeleteTag">{{ tag }}</Tag>
			<Input v-model="newTag">
				<Button icon="ios-add" slot="append" @click="onAddTag">添加</Button>
			</Input>
		</div>
		<Divider orientation="left">故事点</Divider>
		<div class="aui-i-story">
			<p>4小时/故事点</p>
		</div>
		<Divider orientation="left">消息通知</Divider>
		<div class="aui-i-notify">
			<CheckboxGroup v-model="notifyTypes">
				<Checkbox label="desktop">
					<Icon type="logo-twitter"></Icon>
					<span>桌面通知</span>
				</Checkbox>
				<Checkbox label="ding">
					<Icon type="logo-twitter"></Icon>
					<span>钉钉通知通知</span>
				</Checkbox>
			</CheckboxGroup>
			<Input prefix="ios-contact" v-model="dingToken">
				<span slot="prepend">钉机器人Token</span>
				<Button slot="append" @click="onSetDingToken">确定</Button>
			</Input>

		</div>
	</div>
</template>

<script>
	import ProjectService from '@/service/project_service';
	import MemberCard from './member_card';
    import defaultAvatar from '@/images/default-avatar.webp';
    import UserSelectModel from '@/components/model/user_select_model';
    import Cookies from 'js-cookie';
    import helper from '@/utils/helper';

    export default {
        props: ['projectId'],
        components: {
            'member-card': MemberCard,
			'user-select-model': UserSelectModel
		},
		created(){

		},
        data(){
            return{
                settings: {
                    tags: []
				},
                newTag: '',
                dingToken: '',
			}
		},
		computed: {
            avatar(){
                return defaultAvatar;
			}
		},
        created(){
            this.getMembers();
            this.getProject();
		},
		methods: {
            onAddTag(){
                if(this.newTag !== ''){
                    if(this.settings.tags.includes(this.newTag)){
                        this.$Message.warning('标签已存在');
                        return;
                    }
                    this.settings.tags.push(this.newTag);
                    this.newTag = '';
                }
            },
            onDeleteTag(event, name){
                if(name !== ''){
                    helper.removeFromArray(name, this.settings.tags);
                }
            },
            onSetDingToken(){

			}
		}
    }
</script>

<style lang="less" scoped>
	.aui-project-members{
		display: flex;
		flex-wrap: wrap;
		margin: 15px;
	}
	.aui-add-member{
		text-align: center;
		width: 150px;
		margin-left: 5px;

		img{
			width: 80px;
			border-radius: 50px;
			background-image: linear-gradient(-225deg, #69EACB 0%, #EACCF8 48%, #6654F1 100%);
		}

		.aui-i-add-btn{
			margin-top: 10px;
		}
	}
</style>