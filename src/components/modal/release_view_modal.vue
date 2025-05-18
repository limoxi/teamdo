<template>
  <Modal
      v-model="showModal"
      width="80"
      style="top:25px"
      footer-hide
      @on-cancel="onCancel"
  >
    <div class="aui-content" v-if="release">
      <Title :level="3" class="aui-i-title">
        {{ releaseLabel }} v{{ release.version }} {{ release.title }}
        <i class="aui-i-time">{{ release.created_at }}</i>
      </Title>
      <Editor ref="editorInst" :content="release.detail" :readonly="true"/>
    </div>
    <div v-else>
      暂无更新
    </div>
  </Modal>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue'
import {Modal} from 'view-ui-plus'
import ReleaseService from '@/business/release_service'
import Editor from '@/components/editor/editor.vue'
import helper from '@/utils/helper'

const editorInst = ref(null)
const showModal = ref(false)
const release = ref(null)
const latestRelease = ref(null)

const storageKey = 'readReleaseId'
const releaseLabel = computed(() => {
  switch (release.value.label) {
    case 'milestone':
      return '🎉'
    case 'feat':
      return '🍧'
    case 'bugfix':
      return '🪰'
  }
  return ''
})

onMounted(() => {
  ReleaseService.getLatestRelease().then(releaseData => {
    if (releaseData) {
      latestRelease.value = releaseData
      release.value = releaseData
      const readReleaseId = helper.storage.get(storageKey, 0)
      if (parseInt(readReleaseId) < releaseData.id) {
        showModal.value = true
      }
    }
  })
})

const onCancel = () => {
  if (latestRelease.value) {
    helper.storage.set(storageKey, latestRelease.value.id)
  }
  showModal.value = false
}

const show = (releaseId = 0) => {
  if (releaseId > 0) {
    ReleaseService.getReleaseById(releaseId).then(releaseData => {
      release.value = releaseData
    })
  } else {
    release.value = latestRelease.value
  }
  showModal.value = true
}

defineExpose({
  show
})

</script>

<style lang="less" scoped>
:deep(.no-border) {
  border: none !important;
}

.aui-content {
  max-height: 85vh;
  overflow-y: scroll;

  .aui-i-title {
    position: sticky;
    top: 0;
    z-index: 1;
    background-color: white;
    margin-right: 15px;

    .aui-i-time {
      font-size: 14px;
      color: grey;
      float: right;
      margin-right: 25px;
    }
  }
}
</style>
