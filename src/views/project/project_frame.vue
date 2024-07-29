<template>
  <Suspense v-if="projectLoaded">
    <ProjectPage :projectId="projectId"></ProjectPage>
  </Suspense>
</template>

<script setup>
import {defineAsyncComponent, ref} from 'vue'

const props = defineProps(['projectId'])
const projectLoaded = ref(false)
const ProjectPage = defineAsyncComponent(() => import("./project.vue"));
projectLoaded.value = true

</script>

<style scoped lang="less">
.aui-projects {

  li {
    list-style: none;
    margin: 15px;
  }
}

</style>
