<template>
  <div class="aui-project-tags">
    <Button icon="md-add" @click="onAddTag" class="aui-i-add-btn">新增标签</Button>
    <Tag class="aui-i-tag" type="dot" closable :color="tag.color"
         v-for="tag in project.tags" :key="tag.id"
         @on-close="onDelete(tag)"
         @click="onEdit(tag)"
    >
      {{ tag.name }}
    </Tag>
  </div>
  <Modal
      v-model="showModel"
      :title="isCreateMode ? '新增标签' : '编辑标签'"
  >
    <Form ref="tagForm" :model="form" :rules="ruleValidate" :label-width="80">
      <FormItem label="名称" prop="name">
        <Input v-model="form.name"
               show-word-limit maxlength="18"
        />
      </FormItem>
      <FormItem label="颜色" prop="color">
        <RadioGroup v-model="form.color" type="button">
          <Radio v-for="color in colors" border :label="color">
            <Icon type="md-square" :style="`color: ${color}; font-size: 24px; vertical-align: middle`"/>
          </Radio>
        </RadioGroup>
      </FormItem>
    </Form>
    <template #footer>
      <Button @click="onSubmit">确定</Button>
    </template>
  </Modal>
</template>

<script setup>
import TagService from '@/business/tag_service';
import {colors} from '@/utils/constant'
import {computed, inject, ref} from "vue";
import {Message, Modal} from 'view-ui-plus'

const ruleValidate = {
  name: [
    {required: true, message: '名称不能为空', trigger: 'blur'}
  ]
}
const project = inject('project')
const showModel = ref(false)
const mode = ref('create')
const form = ref({
  id: 0,
  name: '',
  color: '#2b85e4'
})
const tagForm = ref(null)

const isCreateMode = computed(() => {
  return mode.value === 'create'
})

const reloadTags = () => {
  project.value.reloadTags().catch(e => {
    Message.error(e.errMsg || '加载标签失败');
  })
}

const onAddTag = () => {
  mode.value = 'create'
  form.value.id = 0
  form.value.name = ''
  form.value.color = '#2b85e4'
  showModel.value = true
}

const onEdit = tag => {
  mode.value = 'mod'
  form.value.id = tag.id
  form.value.name = tag.name
  form.value.color = tag.color
  showModel.value = true
}

const onDelete = (tag) => {
  Modal.confirm({
    title: '删除标签',
    content: `确认删除标签：${tag.name}么`,
    loading: true,
    onOk: () => {
      TagService.deleteTag(
          project.value.id,
          tag.id
      ).then(() => {
        reloadTags()
        Message.success('删除成功');
        Modal.remove()
      }).catch(err => {
        console.error(err)
        Message.error(err.errMsg);
      });
    }
  });
}

const onSubmit = () => {
  tagForm.value.validate((valid) => {
    if (valid) {
      if (isCreateMode.value) {
        TagService.addTag(
            project.value.id,
            form.value.name,
            form.value.color
        ).then(() => {
          Message.success('添加成功');
          resetForm();
        }).catch(err => {
          Message.error(err.errMsg);
        });
      } else {
        TagService.updateTag(
            project.value.id,
            form.value.id,
            form.value.name,
            form.value.color
        ).then(() => {
          Message.success('更新成功');
          resetForm();
        }).catch(err => {
          Message.error(err.errMsg);
        });
      }
    }
  })
}

const resetForm = () => {
  showModel.value = false
  form.value.id = 0
  form.value.name = ''
  form.value.color = '#2b85e4'
  tagForm.value.resetFields()
  reloadTags()
}

</script>

<style lang="less" scoped>
.aui-project-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin: 30px auto;
  width: 80%;

  .aui-i-add-btn {
    display: block;
    margin: 30px 10px 30px 0;
  }
}

</style>
