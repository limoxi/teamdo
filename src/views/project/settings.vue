<template>
  <div class="aui-project-settings">
    <List class="aui-i-menu" border split>
      <ListItem :class="`aui-i-menu-item ${activeMenu==='project'? 'active-list-item': ''}`" @click="onClickMenu('project')">项目配置</ListItem>
      <ListItem :class="`aui-i-menu-item ${activeMenu==='tags'? 'active-list-item': ''}`" @click="onClickMenu('tags')">标签配置</ListItem>
    </List>
    <div class="aui-i-content">
      <template v-if="activeMenu === 'tags'">
        <Button icon="md-add" @click="tagModal.show()" class="aui-i-add-btn">新增标签</Button>
        <div class="aui-i-tags" v-for="bizCode in ['normal_task', 'epic_task']" :key="bizCode">
          <h4 class="aui-i-tags-title">{{ bizCode === 'normal_task'? '看板标签' : '需求标签' }}</h4>
          <Tag class="aui-i-tag" type="dot" closable :color="tag.color"
               v-for="tag in tags.filter(t => t.biz_code === bizCode)" :key="tag.id"
               @on-close="onDeleteTag(tag)"
               @click="tagModal.show(tag)"
          >
            {{ tag.name }}
          </Tag>
        </div>
        <TagModal ref="tagModal"
                  :projectId="project?.id || 0"
                  @update="reloadTags"></TagModal>
      </template>
      <template v-else-if="activeMenu === 'project'">
        <H4>开发中...</H4>
      </template>
    </div>
  </div>

</template>

<script setup>
import {Divider, Message, Modal} from "view-ui-plus";
import {computed, inject, ref} from "vue";
import TagModal from '@/components/modal/tag_modal'
import TagService from '@/business/tag_service';

const project = inject('project')

const activeMenu = ref('tags')
const tagModal = ref(null)

const onClickMenu = menuItem => {
  activeMenu.value = menuItem
}

const reloadTags = () => {
  project.value.reloadTags().catch(e => {
    Message.error(e.errMsg || '加载标签失败');
  })
}

const tags = computed(() => {
  return project.value?.tags || []
})


const onDeleteTag = tag => {
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

</script>

<style scoped lang="less">
.aui-project-settings{
  display: flex;
  margin: 15px 30px;

  .aui-i-menu{
    height: calc(100vh - 80px);
    min-width: 20vw;
    margin-right: 15px;
  }

  .aui-i-content{
    min-width: 75vw;
    height: calc(100vh - 80px);
    overflow-y: scroll;
    overflow-x: hidden;

    .aui-i-tags{
      position: relative;
      margin-top: 30px;

      .aui-i-tags-title{
        display: block;
        position: absolute;
        top: -20px;
      }
    }
  }
}


</style>