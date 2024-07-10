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
                                >{{ p.name }}
                                </DropdownItem>
                            </DropdownMenu>
                        </template>
                    </Dropdown>
                </MenuItem>
                <MenuItem v-for="kanban in kanbans" :key="kanban.id" :name="'kanban/'+kanban.id">{{ kanban.name }}</MenuItem>
                <MenuItem name="members">成员</MenuItem>
                <MenuItem name="stats">统计</MenuItem>
                <MenuItem name="settings">设置</MenuItem>
            </Menu>
        </div>
        <theme-control></theme-control>
        <div class="aui-i-subtitle">
            <strong>{{ project.name }}</strong>
        </div>
        <div class="aui-i-profile">
            <profile></profile>
        </div>
    </div>
</template>
<script setup>
import Logo from '@/components/frame/block/logo';
import Profile from '@/components/frame/block/profile';
import ThemeControl from '@/components/frame/block/theme_control';
import {computed, inject, onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import {useConfigStore} from "@/store";
import {storeToRefs} from "pinia";
import {Dropdown, DropdownItem, DropdownMenu, Icon, MenuItem, Message} from 'view-ui-plus'
import ProjectService from "../../../business/project_service";

const router = useRouter()

const configStore = useConfigStore()
const {theme} = storeToRefs(configStore)

const project = inject('project')
const kanbans = computed(() => project.value.kanbans)
const projects = ref([])


let activeName = ref('kanban')

onMounted(() => {
    activeName.value = `kanban/${kanbans.value[0]}`
    getProjects()
})

const onMenuChanged = (name) => {
    if (name !== activeName.value) {
        activeName.value = name;
        const params = {
          projectId: project.value.id
        }
        if (name.includes('kanban')) {
          const sps = name.split('/')
          name = sps[0]
          params['kanbanId'] = sps[1]
        }
        router.push({
            name: name,
            params: params
        });
    }
}
const onSwitchProject = (pid) => {
  alert(pid)
  let newPath = window.location.pathname + ''
  if (newPath.includes('kanban')) {
    newPath = newPath.replace(/\/project\/.*\/kanban\/.*/, `/project/${pid}/kanban/${getFirstKanbanIdForProject(pid)}`)
    console.log(newPath, '1111111111111111')
  } else {
    newPath = newPath.replace(/\/project\/.*\//, `/project/${pid}/`)
    console.log(newPath, '22222222222222')
  }
  window.location.href = newPath
}
const getProjects = () => {
    ProjectService.getLintProjects().then(data => {
        projects.value = data;
    }).catch(err => {
        Message.error(err.errMsg)
    })
}

const getFirstKanbanIdForProject = pid => {
  for(const p of projects.value){
    if (p.id === pid) {
      return p.kanbans[0].id
    }
  }
  return 0
}
</script>

<style lang="less" scoped>
.aui-header {
  .aui-i-subtitle {
    font-size: 16px;
  }
}
</style>
