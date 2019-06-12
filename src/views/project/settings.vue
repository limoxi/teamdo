<template>
	<div class="aui-project-settings">
		<Card title="项目设置" icon="ios-options" :padding="0" shadow class="aui-i-card">
			<CellGroup>
				<Cell title="小时/故事点" label="时间对故事点的估算">
					<InputNumber :max="6" :min="2" v-model="settings.HNUT"
								 :editable="editable" slot="extra"></InputNumber>
				</Cell>
				<Cell title="工作时间" label="任务耗时只在工作时间范围内统计">
					<TimePicker format="HH:mm" type="timerange" placement="bottom-end"
						:open="openTimePicker"
						:value="settings.workingTimeRange"
						confirm
						transfer
						:steps="[1, 30]"
						@on-ok="onConfirmPicker"
						@on-change="onPickerChange"
						slot="extra"
					>
						<a href="javascript:void(0)" @click="onSelectWorkingTime" class="aui-icon-scale">
							<Icon type="md-clock"></Icon>
							<template v-if="settings.workingTimeRange.length===0">设置工作时间</template>
							<template v-else>{{ settings.workingTimeRange.join('~') }}</template>
						</a>
					</TimePicker>
				</Cell>
				<Cell title="任务进度" label="开启任务进度功能">
					<Switch v-model="settings.enableTaskProgress" slot="extra"></Switch>
				</Cell>
				<Cell title="桌面通知">
					<Switch v-model="settings.desktopNotify" slot="extra"></Switch>
				</Cell>
			</CellGroup>
		</Card>
	</div>
</template>

<script>
	import ProjectService from '@/service/project_service';
	import MemberCard from './member_card';
    import defaultAvatar from '@/images/default-avatar.webp';
    import UserSelectModel from '@/components/model/user_select_model';
    import helper from '@/utils/helper';

    export default {
        props: ['projectId'],
        components: {
            'member-card': MemberCard,
			'user-select-model': UserSelectModel
		},
        data(){
            return{
                settings: {
                    enableTaskProgress: true,
                    desktopNotify: false,
					HNUT: 4,
                    workingTimeRange: ['12:30','18:00']
				},
                openTimePicker: false
			}
		},
		computed: {
            editable(){
               return  true;
			}
		},
        created(){
		},
		methods: {
            onSelectWorkingTime(){
				this.openTimePicker = true;
			},
			onConfirmPicker(){
                this.openTimePicker = false;
			},
            onPickerChange(value){
                this.settings.workingTimeRange = value;
			}
		}
    }
</script>

<style lang="less" scoped>
	.aui-project-settings{
		display: flex;
		justify-content: center;

		.aui-i-card{
			width: 68vw;
		}

	}
</style>