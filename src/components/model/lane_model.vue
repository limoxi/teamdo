<template>
	<Modal
		v-model="showModel"
		:title="title"
		:width="350"
		@on-cancel="cancel"
	>
		<Form ref="form" :model="form" :rules="ruleValidate" :label-width="80">
			<FormItem label="泳道名称" prop="name">
				<Input v-model="form.name" placeholder=""></Input>
			</FormItem>
			<FormItem label="WIP" prop="wip">
				<InputNumber :max="15" :min="1" v-model="form.wip" :editable="false"></InputNumber>
			</FormItem>
		</Form>
		<Button slot="footer" @click="confirm">确定</Button>
	</Modal>
</template>

<script>
    import LaneService from '@/service/lane_service';
    export default {
        props: ['show', 'mode', 'lane', 'projectId', 'kanbanId'],
		data (){
			return {
                ruleValidate: {
                    name: [
                        {required: true, message: '泳道名称不能为空', trigger: 'blur'}
                    ],
                    wip: [
                        {required: true, type: 'number', message: '请填写泳道最大任务数', trigger: 'blur'}
                    ]
                }
			}
        },
		computed: {
            title(){
                return this.mode === 'create'? '添加泳道': '修改泳道';
			},
            showModel: {
                get(){
                    return this.show;
				},
				set(newValue){
                    this.$emit('update:show', newValue);
				}
			},
			form(){
                return {
                    id: this.lane? this.lane.id: 0,
                    name: this.lane? this.lane.name: '',
                    wip: this.lane? this.lane.wip: 1
                }
			}
		},
		methods: {
            confirm (){
                this.$refs['form'].validate((valid) => {
                    console.log(this.form);
                    if (valid) {
                        if(this.mode === 'create'){
                            LaneService.addLane(this.projectId, this.kanbanId, this.form).then(()=>{
                                window.EventBus.$emit('laneUpdated');
                                this.$Message.success('泳道已添加');
                                this.showModel = false;
                                this.resetForm();
							}).catch(err=>{
                                this.$Message.error(err.errMsg);
							})
						}else{
                            let newLane = {
                                id: this.lane.id,
                                name: this.form.name,
                                wip: this.form.wip
                            };
                            LaneService.updateLane(this.projectId, newLane).then(() =>{
                                window.EventBus.$emit('laneUpdated');
                                this.$Message.success('泳道已更新');
                                this.showModel = false;
                            }).catch(err =>{
                                this.$Message.error(err.errMsg);
                            });
						}
                    } else {
                        this.$Message.error('请检查填写项！');
                    }
                })
            },
            cancel (){
                this.resetForm();
            },
            resetForm(){
                this.$refs['form'].resetFields();
            }
		}
    }
</script>

<style scoped lang="less">

</style>