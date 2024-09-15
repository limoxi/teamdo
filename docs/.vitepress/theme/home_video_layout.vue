<template>
  <Layout>
    <template #home-hero-after>
      <video loop :src="withBase('assets/home_video.webm')" autoplay muted></video>
    </template>
  </Layout>
</template>

<script setup>
import DefaultTheme from 'vitepress/theme'
import {withBase} from 'vitepress'

const {Layout} = DefaultTheme

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