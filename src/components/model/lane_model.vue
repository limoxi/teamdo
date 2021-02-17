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
        <InputNumber :max="15" :min="0" v-model="form.wip" :editable="false"></InputNumber>
      </FormItem>
      <FormItem label="任务终点" prop="endPoint">
        <Switch v-model="form.endPoint">
          <span slot="open">是</span>
          <span slot="close">否</span>
        </Switch>
      </FormItem>
      <FormItem label="权限" prop="validRoles">
        <Select v-model="form.validRoles" multiple>
          <Option v-for="role in roles" :value="role.id" :key="role.id">{{ role.name }}</Option>
        </Select>
      </FormItem>
    </Form>
    <Button slot="footer" @click="confirm">确定</Button>
  </Modal>
</template>

<script>
import PermissionService from '@/service/permission_service';
import LaneService from '@/service/lane_service';
import helper from '@/utils/helper';

export default {
  props: ['show', 'mode', 'lane', 'projectId', 'kanbanType'],
  data() {
    return {
      roles: [],
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
    title() {
      return this.mode === 'create' ? '添加泳道' : '修改泳道';
    },
    showModel: {
      get() {
        if (this.show) {
          PermissionService.getAllGroups().then(data => {
            this.roles = data;
          }).catch(err => {
            this.$Message.error('获取角色列表失败');
          });
        }
        return this.show;
      },
      set(newValue) {
        this.$emit('update:show', newValue);
      }
    },
    form() {
      if (helper.isEmptyObject(this.lane)) {
        return {
          id: 0,
          name: '',
          wip: 1,
          endPoint: false,
          validRoles: []
        }
      } else {
        return {
          id: this.lane.id,
          name: this.lane.name,
          wip: this.lane.wip,
          endPoint: this.lane.end_point,
          validRoles: this.lane.valid_roles || []
        }
      }
    }
  },
  methods: {
    confirm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.mode === 'create') {
            LaneService.addLane(this.projectId, this.kanbanType, this.form).then(() => {
              window.EventBus.$emit('laneUpdated');
              this.$Message.success('泳道已添加');
              this.showModel = false;
              this.resetForm();
            }).catch(err => {
              this.$Message.error(err.errMsg);
            })
          } else {
            let newLane = {
              id: this.lane.id
            };
            helper.extend(newLane, this.form);
            LaneService.updateLane(this.projectId, newLane).then(() => {
              window.EventBus.$emit('laneUpdated');
              this.$Message.success('泳道已更新');
              this.showModel = false;
              this.resetForm();
            }).catch(err => {
              this.$Message.error(err.errMsg);
            });
          }
        } else {
          this.$Message.error('请检查填写项！');
        }
      })
    },
    cancel() {
      this.resetForm();
    },
    resetForm() {
      this.$refs['form'].resetFields();
    }
  }
}
</script>

<style scoped lang="less">

</style>
