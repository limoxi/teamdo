<template>
  <Layout>
    <template #home-hero-after>
      <video loop :src="videoSrc" autoplay muted></video>
    </template>
  </Layout>
</template>

<script setup>
import {ref} from 'vue'
import DefaultTheme from 'vitepress/theme'

const {Layout} = DefaultTheme

const videoSrc = ref('assets/home_video.webm')
</script>

<style scoped lang="less">
video {
  position: absolute;
  top: var(--vp-nav-height);
  right: 0;
  width: 100%;
  height: auto;
  padding: 0 var(--vp-nav-height);
}

</style>