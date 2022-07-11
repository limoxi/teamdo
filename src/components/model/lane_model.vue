<template>
  <Modal
      v-model="showModel"
      :title="title"
      :width="350"
      @on-cancel="cancel"
  >
    <Form ref="form" :model="form" :rules="ruleValidate" :label-width="80">
      <FormItem label="泳道名称" prop="name">
        <Input v-model="form.name" placeholder="" />
      </FormItem>
      <FormItem label="WIP" prop="wip" v-if="!isCreateMode">
        <InputNumber :max="15" :min="0" v-model="form.wip" :editable="false"></InputNumber>
      </FormItem>
<!--      <FormItem label="权限" prop="validRoles">-->
<!--        <Select v-model="form.validRoles" multiple>-->
<!--          <Option v-for="role in roles" :value="role.id" :key="role.id">{{ role.name }}</Option>-->
<!--        </Select>-->
<!--      </FormItem>-->
    </Form>
    <template #footer>
      <Button slot="footer" @click="confirm">确定</Button>
    </template>
  </Modal>
</template>

<script>
import PermissionService from '@/service/permission_service';
import LaneService from '@/service/lane_service';
import helper from '@/utils/helper';
import {events, EventBus} from '@/service/event_bus'

export default {
  props: ['show', 'mode', 'lane', 'projectId'],
  data() {
    return {
      roles: [],
      ruleValidate: {
        name: [
          {required: true, message: '泳道名称不能为空', trigger: 'blur'}
        ]
      }
    }
  },
  computed: {
    isCreateMode(){
      return this.mode === 'create'
    },
    title() {
      return this.isCreateMode ? '添加泳道' : '修改泳道';
    },
    showModel: {
      get() {
        // if (this.show) {
        //   PermissionService.getAllGroups().then(data => {
        //     this.roles = data;
        //   }).catch(err => {
        //     this.$Message.error('获取角色列表失败');
        //   });
        // }
        return this.show;
      },
      set(newValue) {
        this.$emit('update:show', newValue);
      }
    },
    form() {
      if (helper.isEmptyObject(this.lane) || this.isCreateMode) {
        return {
          id: 0,
          name: '',
          wip: 8,  // 默认
          endPoint: false,
          validRoles: []
        }
      } else {
        return {
          id: this.lane.id,
          name: this.lane.name,
          wip: this.lane.wip,
          validRoles: this.lane.valid_roles || []
        }
      }
    }
  },
  methods: {
    confirm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.isCreateMode) {
            LaneService.addLane(this.projectId, this.form, this.lane ? this.lane.id : 0).then(() => {
              EventBus.emit(events.LANE_UPDATED);
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
              EventBus.emit(events.LANE_UPDATED);
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
