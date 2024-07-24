<template>
  <div class="aui-releases">
    <Timeline pending>
      <TimelineItem color="green" v-for="release in releases" :key="release.id">
        <Space type="flex" @click="onClickRelease(release)">
          <Text>v{{release.version}} {{release.title}}</Text>
          <Text class="aui-i-time" type="secondary">{{release.created_at}}</Text>
        </Space>
        <Space class="aui-i-content" direction="vertical">
          <Text v-for="(outline, index) in release.outlines" :key="index">
            <i class="ri-circle-fill aui-i-icon"></i>
            {{outline}}
          </Text>
        </Space>
      </TimelineItem>
      <TimelineItem v-if="pageInfo.hasNext"><a href="javascript:void(0)" @click="addNextPageReleases">查看更多</a>
      </TimelineItem>
    </Timeline>
  </div>
</template>

<script setup>

import {onMounted, ref} from 'vue'
import ReleaseService from '@/business/release_service'
import {Message, Space, Text, Timeline, TimelineItem} from 'view-ui-plus'

const releases = ref([])
const pageInfo = ref({
  curPage: 1,
  pageSize: 20,
  hasNext: true
})

const emits = defineEmits(['onClickRelease'])

onMounted(() => {
  reloadReleases()
})

const reloadReleases = () => {
  loadReleases()
}

const onClickRelease = (release) => {
  emits('onClickRelease', release)
}

const loadReleases = () => {
  ReleaseService.getReleases({}, {
    curPage: 1,
    pageSize: pageInfo.value.pageSize
  }).then(resp => {
    releases.value = resp.releases
    if (resp.page_info.cur_page >= resp.page_info.max_page) {
      pageInfo.value.hasNext = false
    }
  }).catch(e => {
    Message.error(e.errMsg || '加载标签失败')
  })
}

const addNextPageReleases = () => {
  pageInfo.value.curPage += 1
  ReleaseService.getReleases({}, {
    curPage: pageInfo.value.curPage,
    pageSize: pageInfo.value.pageSize
  }).then(resp => {
    releases.value = [...releases.value, ...resp.releases]
  }).catch(e => {
    Message.error(e.errMsg || '加载失败')
  })
}

defineExpose({
  reloadReleases
})

</script>

<style scoped lang="less">
.aui-releases {
  margin-top: 20px;

  .aui-i-time {
    margin-left: 15px;
    font-size: 12px;
    font-weight: bolder;
  }

  .aui-i-content {
    margin-top: 5px;

    .aui-i-icon {
      font-size: 6px;
      color: cornflowerblue;
      vertical-align: middle;
    }
  }

}
</style>