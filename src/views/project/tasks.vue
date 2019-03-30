<template>
	<div class="aui-tasks">
		<div class="aui-i-action">
			<Button icon="md-add" @click="showTaskModel" class="aui-icon-scale">添加任务</Button>
		</div>

		<div class="aui-i-list">
			<Table :data="tasks" :columns="columns" border
				   @on-sort-change="onSort"
			>
				<template slot-scope="{ row, index }" slot="action">
					<Tooltip content="进入看板" placement="top">
						<Button icon="logo-buffer" class="aui-icon-scale"
								v-if="row.status==='未开始'"
								@click="onClickToKanban(row)"></Button>
					</Tooltip>
					<Tooltip content="放弃任务" placement="top">
						<Button icon="md-close" class="aui-icon-scale"
								v-if="row.status==='未开始'"
								@click="onClickAbort(row)"></Button>
					</Tooltip>
				</template>
			</Table>
			<div class="aui-paginator">
				<Page
					:total="pageInfo.total_object_count"
					:current="pageInfo.cur_page"
					:page-size="pageInfo.count_per_page"
					  size="small"
					  @on-change="onChangePage"
					show-elevator
				></Page>
			</div>
		</div>
		<task-model
			mode="create"
			:show.sync="showModel"
			:projectId="projectId"
			@taskAdded="onTaskAdded"
		></task-model>
	</div>
</template>

<script>
    import ProjectService from '@/service/project_service';
    import TaskService from '@/service/task_service';
	import TaskModel from '@/components/model/task_model';

    export default {
        props: ['projectId'],
        created(){
            this.getTasks();
		},
        methods: {
            resetData(){
                this.filters = {};
                this.orderFields = [];
                this.pageInfo['cur_page'] = 1;
			},
            onTaskAdded(){
                this.resetData();
                this.getTasks();
			},
            onClickToKanban(task){
                TaskService.appendToKanban(this.projectId, 'kanban', task.id).then(()=>{
                    task.status = '进行中';
                    this.$Message.success('操作成功');
				}).catch(err=>{
                    this.$Message.warning(err.errMsg);
				});
			},
            onClickToSprint(taskId){
                TaskService.appendToKanban(this.projectId, 'sprint', taskId).then(()=>{
                    this.$Message.success('操作成功');
                }).catch(err=>{
                    this.$Message.warning(err.errMsg);
                });
            },
            onClickAbort(task){
                TaskService.abortTask(this.projectId, task).then(()=>{
                    task.status = '已放弃';
                    this.$Message.success('操作成功');
                }).catch(err=>{
                    this.$Message.warning(err.errMsg);
                });
			},
            onChangePage(targetPageNum){
                this.pageInfo.targetPage = targetPageNum;
                this.getTasks();
			},
            onSort(data){
                this.orderFields = [];
                let orderType = data['order'];
				let field = data['key'];
                let orderFields = [];
                if(orderType === 'asc'){
                    this.orderFields.push(field);
				}else{
                    this.orderFields.push('-'+field);
				}
                this.getTasks();
			},
            getTasks(){
                let page = {
                    cur_page: this.pageInfo.targetPage,
					count_per_page: this.pageInfo.count_per_page
				}
                TaskService.getTasks(this.projectId, this.filters, this.orderFields, page).then(data=>{
                    this.tasks = data['tasks'];
                    this.pageInfo = data['page_info'];
                    this.pageInfo.targetPage = this.pageInfo.cur_page;
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
		        'filters': {},
				'orderFields': [],
		        'tasks': [],
                'pageInfo': {
		            'targetPage': 1,
		            'cur_page': 1,
					'count_per_page': 15,
					'total_object_count': 0
                },
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
				'columns': [{
		            'title': '编号',
					'key': 'id',
                    'sortable': 'custom',
					'width': 80,
					'align': 'center'
				}, {
		            'title': '标题',
					'key': 'name',
					'minWidth': 240,
				}, {
		            'title': '重要度',
					'key': 'importance',
                    'sortable': 'custom',
					'width': 75,
					'align': 'center',
                    'filters': [{
                        'label': '普通',
                        'value': 0
                    }, {
                        'label': '紧急',
                        'value': 1
                    }, {
                        'label': '非常紧急',
                        'value': 2
                    }],
                    'filterMultiple': false,
                    'filterRemote': (values) =>{
                        if(values.length === 0){
                            delete this.filters['importance__range'];
                        }else{
                            let level = values[0]
                            let importance = [];
                            if(level === 0){
                                importance = [0, 3];
							}else if(level === 1){
                                importance = [4, 6];
							}else if(level === 2){
                                importance = [7, 9];
							}
                            this.filters['importance__range'] = importance;
                        }
                        this.getTasks();
                    }
				}, {
		            'title': '故事点',
					'key': 'story_point',
					'width': 75
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
                    'sortable': 'custom',
                    'width': '150'
				}, {
                    'title': '最后更新时间',
                    'key': 'updated_at',
                    'className': 'aui-i-timewidth',
                    'sortable': 'custom',
					'width': '150'
                }, {
                    'title': '状态',
                    'key': 'status',
					'width': 100,
                    'filters': [{
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
					'filterMultiple': false,
					'filterRemote': (values) =>{
                        if(values.length === 0){
							delete this.filters['status'];
						}else{
                            this.filters['status'] = values[0];
						}
						this.getTasks();
					}
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
			}
		}
	}
</style>