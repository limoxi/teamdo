<template>
  <div class="aui-project-tags">
    <Button icon="md-add" @click="onAddTag" class="aui-i-add-btn">新增标签</Button>
    <Tag class="aui-i-tag" type="dot" closable :color="tag.color"
        v-for="tag in tags" :key="tag.id"
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
import TagService from '@/service/tag_service';
import {colors} from '@/utils/constant'
import {events, EventBus} from '@/service/event_bus'
import helper from '@/utils/helper';
import {ref, inject, onMounted, computed} from "vue";
import {Message, Modal} from 'view-ui-plus'

const ruleValidate = {
  name: [
    {required: true, message: '名称不能为空', trigger: 'blur'}
  ]
}
const project = inject('project').value
const tags = ref([])
const showModel = ref(false)
const mode = ref('create')
const defaultForm = {
  id: 0,
  name: '',
  color: '#2b85e4'
}
const form = ref(defaultForm)
const tagForm = ref(null)

const isCreateMode = computed(() => {
  return mode.value === 'create'
})

onMounted(() => {
  getTags()
})

const getTags = () => {
  TagService.getTagsForProject(project.id).then(data => {
    tags.value = data;
  }).catch(err => {
    Message.error(err.errMsg);
  });
}

const onAddTag = () => {
  mode.value = 'create'
  form.value = defaultForm
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
          project.id,
          tag.id
      ).then(() => {
        helper.removeFromArray(tag, tags.value, 'id')
        Message.success('删除成功');
        Modal.remove()
      }).catch(err => {
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
            project.id,
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
            project.id,
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
  form.value = defaultForm
  tagForm.value.resetFields()
  getTags()
}

</script>

<style lang="less" scoped>
.aui-project-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin: 30px auto;
  width: 80%;

  .aui-i-add-btn{
    display: block;
    margin: 30px 10px 30px 0;
  }
}

</style>
