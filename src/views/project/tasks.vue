<template>
	<div class="aui-tasks">
		<div class="aui-i-action">
			<Form ref="filterForm" :model="filters">
				<FormItem label="任务状态">
					<Select v-model="filters.status" style="width:180px" aria-label="statusFilter" @on-change="onStatusFilterChange">
						<Option v-for="option in statusOptions" :value="option.value" :key="option.value">
							{{ option.label }}</Option>
					</Select>
				</FormItem>
				<FormItem label="重要度">
					<Select v-model="filters.importance" style="width:180px" aria-label="importanceFilter" @on-change="onImportanceFilterChange">
						<Option v-for="option in importanceOptions" :value="option.value" :key="option.value">
							{{ option.label }}</Option>
					</Select>
				</FormItem>
				<FormItem label="参与者">
					<Select v-model="filters.users" style="width:180px" aria-label="userFilter" @on-change="onUserFilterChange">
						<Option v-for="user in projectUsers" :value="user.id" :key="user.id">
							{{ user.nickname }}</Option>
					</Select>
				</FormItem>
				<FormItem>
					<Button icon="md-add" @click="showTaskModel" class="aui-icon-scale">添加任务</Button>
				</FormItem>
			</Form>
		</div>
		<div class="aui-i-list">
			<Table :data="tasks" :columns="columns" border>
				<template slot-scope="{ row, index }" slot="action">
					<Tooltip content="进入看板" placement="top">
						<Button icon="ios-eye" @click="onClickToKanban(row.id)"></Button>
					</Tooltip>
				</template>
			</Table>
			<div style="float: right;">
				<Page :total="pageInfo.total_count" :current="pageInfo.page" @on-change="onChangePage"></Page>
			</div>
		</div>
		<task-model
			mode="create"
			:show.sync="showModel"
			:projectId="projectId"
		></task-model>
	</div>
</template>

<script>
    import ProjectService from '@/service/project_service';
    import TaskService from '@/service/task_service';
	import TaskModel from '@/components/model/task_model';

    export default {
        created(){
            this.getTasks();
		},
        methods: {
            onClickToKanban(taskId){
                TaskService.appendToKanban(this.projectId, 'kanban', taskId).then(()=>{
                    this.$Message.success('操作成功');
				}).catch(err=>{
                    this.$Message.warning(err.errMsg);
				})
			},
            onClickToSprint(taskId){
                TaskService.appendToKanban(this.projectId, 'sprint', taskId).then(()=>{
                    this.$Message.success('操作成功');
                }).catch(err=>{
                    this.$Message.warning(err.errMsg);
                })
            },
            onChangePage(){},
            onStatusFilterChange(val){
                alert(val);
			},
			onImportanceFilterChange(val){
                alert(val);
			},
            onUserFilterChange(val){
                alert(val);
			},
            getTasks(){
                TaskService.getTasks(this.projectId).then(data=>{
                    this.tasks = data['tasks'];
                    this.pageInfo = data['page_info'];
				}).catch(err=>{
                    this.$Message.warning(err.errMsg);
				})
			},
            showTaskModel(){
				this.showModel = true;
			},
		},
		components: {
            'task-model': TaskModel
		},
		data(){
		    return {
                'projectId': ProjectService.getProjectIdFromPath(this.$route.path),
		        'tasks': [],
                'pageInfo': {},
				'showModel': false,
				'projectUsers': [{
		            'id': 0,
					'nickname': '全部'
				}],
				'importanceOptions': [{
                    'label': '全部',
                    'value': 0
                }, {
		            'label': '非常紧急',
					'value': '70, 100'
				}, {
                    'label': '紧急',
                    'value': '50, 70'
                }, {
                    'label': '普通',
                    'value': '1, 50'
                }],
				'statusOptions': [{
					'label': '全部',
					'value': -1
				}, {
                    'label': '未开始',
                    'value': 0
                }, {
                    'label': '进行中',
                    'value': 1
                }, {
                    'label': '已完成',
                    'value': 2
                }, {
                    'label': '已放弃',
                    'value': 3
                }],
				'filters': {
		          	'status': null,
					'importance': null,
					'users': null
				},
				'columns': [{
		            'title': '编号',
					'key': 'id',
                    'sortable': 'custom'
				}, {
		            'title': '标题',
					'key': 'name'
				}, {
		            'title': '重要度',
					'key': 'importance',
                    'sortable': 'custom'
				}, {
		            'title': '故事点',
					'key': 'story_point'
				}, {
		            'title': '参与用户',
					'key': 'users',
					'render': null
				}, {
		            'title': '标签',
					'key': 'tag'
				}, {
		            'title': '创建时间',
					'key': 'created_at',
					'className': 'aui-i-timewidth',
                    'sortable': 'custom'
				}, {
                    'title': '最后更新时间',
                    'key': 'updated_at',
                    'className': 'aui-i-timewidth',
                    'sortable': 'custom'
                }, {
		            'title': '操作',
					'key': 'action',
					'slot': 'action'
				}]
			}
		}
    }
</script>

<style scoped lang="less">
	.aui-tasks{
		.aui-i-action{
			.ivu-form-item{
				margin-bottom: 0;
				margin-right: 15px;
				display: inline-flex;
			}
		}
		& > div{
			margin: 5px 15px;
		}

		.aui-i-list{
			.aui-i-timewidth{
				display: table-cell;
				width: 100px;
			}
		}
	}
</style>