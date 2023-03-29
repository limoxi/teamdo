<template>
    <div class="aui-header">
        <logo></logo>
        <div class="aui-i-menu">
            <Menu mode="horizontal" :theme="theme" :active-name="activeName" @on-select="onMenuChanged">
                <MenuItem name="projects">项目</MenuItem>
                <!--                <MenuItem name="works">工单</MenuItem>-->
                <MenuItem name="users">用户</MenuItem>
                <!--                <MenuItem name="settings">设置</MenuItem>-->
            </Menu>

        </div>
        <theme-control></theme-control>
        <div class="aui-i-action">
            <profile></profile>
        </div>
    </div>
</template>
<script setup>
import Logo from '@/components/frame/block/logo';
import Profile from '@/components/frame/block/profile';
import ThemeControl from '@/components/frame/block/theme_control';
import {useConfigStore, useModalStore} from "@/store"
import {storeToRefs} from "pinia";
import {onMounted, ref} from "vue";
import {useRouter} from "vue-router";
import {Message} from "view-ui-plus";

const modalStore = useModalStore()
const configStore = useConfigStore()
const {theme} = storeToRefs(configStore)
let activeName = ref('projects')

const router = useRouter()

onMounted(() => {
    activeName.value = router.currentRoute.value.name
})

const onMenuChanged = (name) => {
    if (name !== activeName.value) {
        activeName.value = name;
        switch (name) {
            case 'settings':
            case 'works':
                Message.info('尽请期待！')
                return
        }
        router.push({
            name: name
        });
    }
}

</script>

<style lang="less" scoped>

</style>
