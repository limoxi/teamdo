<template>
  <div class="aui-header">
    <logo></logo>
    <div class="aui-i-menu">
      <Menu mode="horizontal" :theme="theme" :active-name="activeName" @on-select="onMenuChanged">
        <MenuItem name="projects">
          <Dropdown transfer placement="right-start" @on-click="onSwitchProject">
                        <span>
                          项目<Icon type="ios-arrow-down"></Icon>
                        </span>
            <template #list>
              <DropdownMenu>
                <DropdownItem v-for="p in projects" :key="p.id"
                              :disabled="p.id === project.id"
                              :name="p.id"
                >{{p.name}}
                </DropdownItem>
              </DropdownMenu>
            </template>
          </Dropdown>
        </MenuItem>
        <MenuItem name="epics">需求</MenuItem>
        <MenuItem name="kanban">看板</MenuItem>
        <MenuItem name="members">成员</MenuItem>
        <MenuItem name="stats">统计</MenuItem>
        <MenuItem name="settings">设置</MenuItem>
      </Menu>
    </div>

    <Icon type="ios-megaphone" class="aui-release-btn" @click="releaseRef?.show"/>
    <ThemeControl/>
    <div class="aui-i-subtitle">
      <strong>{{project.name}}</strong>
    </div>
    <div class="aui-i-profile">
      <profile></profile>
    </div>
  </div>
  <ReleaseViewModal ref="releaseRef"/>
</template>
<script setup>
import Logo from '@/components/frame/block/logo'
import Profile from '@/components/frame/block/profile'
import ThemeControl from '@/components/frame/block/theme_control'
import {inject, onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import {useConfigStore} from '@/store'
import {storeToRefs} from 'pinia'
import {Dropdown, DropdownItem, DropdownMenu, Icon, MenuItem, Message} from 'view-ui-plus'
import ProjectService from '../../../business/project_service'
import ReleaseViewModal from '@/components/modal/release_view_modal.vue'

const router = useRouter()

const configStore = useConfigStore()
const {theme} = storeToRefs(configStore)

const project = inject('project')
const projects = ref([])

let activeName = ref('kanban')
const releaseRef = ref(null)

onMounted(() => {
  activeName.value = getDefaultActiveName()
  getProjects()
})

const getDefaultActiveName = () => {
  let defaultName = 'kanban'
  let path = router.currentRoute.value.path
  let splits = path.split('/')
  let l = splits.length
  if (splits[l - 3] === 'project') {
    defaultName = splits[l - 1]
  }
  return defaultName
}
const onMenuChanged = (name) => {
  if (name !== activeName.value) {
    activeName.value = name
    router.push({
      name: name,
      params: {
        projectId: project.value.id
      }
    })
  }
}
const onSwitchProject = (pid) => {
  window.location.href = window.location.pathname.replace(/\/project\/.*\//, `/project/${pid}/`)
}
const getProjects = () => {
  ProjectService.getLintProjects().then(data => {
    projects.value = data
  }).catch(err => {
    Message.error(err.errMsg)
  })
}
</script>

<style lang="less" scoped>
.aui-header {
  .aui-i-subtitle {
    font-size: 16px;
  }

  .aui-release-btn {
    font-size: 18px;
    cursor: pointer;

    &:hover {
      transform: scale(1.1);
    }
  }
}
</style>
