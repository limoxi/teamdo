<template>
  <div class="layout">
    <Layout>
      <slot name="header"></slot>
      <Content class="aui-content">
        <slot name="content"></slot>
      </Content>
    </Layout>
  </div>
</template>

<script setup>

</script>

<style lang="less" scoped>
.aui-content {
  min-height: calc(100vh + 35px);
}
</style>
