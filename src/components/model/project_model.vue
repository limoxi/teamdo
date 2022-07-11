<template>
  <Modal
      v-model="showModel"
      :title="title"
      @on-ok="confirm"
      @on-cancel="cancel"
  >
    <Form ref="form" :model="form" :rules="ruleValidate" :label-width="80">
      <FormItem label="项目名" prop="name">
        <Input v-model="form.name" />
      </FormItem>
      <FormItem v-if="!isCreateMode" label="项目前缀" prop="prefix">
        <Input v-model="form.prefix" readonly disabled />
      </FormItem>
      <FormItem label="简介" prop="desc">
        <Input v-model="form.desc" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="项目简要描述" />
      </FormItem>
    </Form>
  </Modal>
</template>

<script>
import ProjectService from '@/service/project_service';

export default {
  props: ['show', 'mode', 'project'],
  data() {
    return {
      form: {
        id: 0,
        name: '',
        prefix: '',
        desc: ''
      },
      ruleValidate: {
        name: [
          {required: true, message: '项目名不能为空', trigger: 'blur'}
        ],
        desc: [
          {required: true, message: '简要描述一下这个项目吧', trigger: 'blur'}
        ]
      }
    }
  },
  watch: {
    project(newV, oldV){
      this.form.id = newV.id
      this.form.name = newV.name
      this.form.prefix = newV.prefix
      this.form.desc = newV.desc
    }
  },
  computed: {
    title() {
      return this.isCreateMode ? '创建项目' : '更新项目';
    },
    showModel: {
      get() {
        return this.show;
      },
      set(newValue) {
        this.$emit('update:show', newValue);
      }
    },
    isCreateMode(){
      return this.mode === 'create'
    }
  },
  methods: {
    confirm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.isCreateMode) {
            ProjectService.createProject(
                this.form.name,
                this.form.desc
            ).then(() => {
              this.$Message.success('成功创建新项目');
              this.resetForm();
              this.$emit('projectCreated');
            }).catch(err => {
              this.$Message.error(err.errMsg);
            });
          } else {
            ProjectService.updateProject(
                this.form.id,
                this.form.name,
                this.form.desc
            ).then(() => {
              this.$Message.success('更新成功');
              this.$emit('projectUpdated', this.form);
            })
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
