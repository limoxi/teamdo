<template>
    <div class="aui-projects-bar">
        <div class="aui-i-left">
            <Button type="text" icon="md-add" @click="onAddProject" class="aui-icon-scale">添加项目</Button>
        </div>
        <div class="aui-i-right">
            <Icon type="md-refresh" class="aui-i-icon" @click="onFreshProjects"/>
            <Input
                    placeholder="搜索项目"
                    :border="false"
                    style="width: 150px"
                    class="aui-i-filter"
                    v-model="filteredProject"
                    clearable
                    @on-change="handleSearch"
            >
                <template #prefix>
                    <Icon type="ios-search"/>
                </template>
            </Input>
        </div>
    </div>
</template>

<script setup>
import {ref} from 'vue'
import {Message} from "view-ui-plus"
import {useModalStore} from "@/store"

const modalStore = useModalStore()

const filters = ref({})
const emit = defineEmits(['search'])
const filteredProject = ref('')

const handleSearch = (force = false) => {
    emit('search', {
        'name': filteredProject.value,
        'force': force
    })
}

const onAddProject = () => {
    modalStore.show('projectModal')
}

let refreshing = false
const onFreshProjects = () => {
    if (refreshing) {
        Message.warning('请勿频繁刷新...')
        return
    }
    refreshing = true
    handleSearch(true)
    Message.success({
        content: '刷新列表...',
        duration: 5,
        onClose: () => {
            refreshing = false
        }
    })
}

</script>

<style lang="less" scoped>
.aui-projects-bar {
  width: 100%;
  max-height: 32px;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  margin-top: 1px;
  padding: 0 5px;

  .aui-i-icon {
    margin-right: 10px;
    font-size: 16px;
    vertical-align: middle;
    cursor: pointer;

    &:hover {
      transform: scale(1.1);
    }
  }

  .aui-i-filter {
    width: 135px;
    margin-left: 10px;
  }

}
</style>
