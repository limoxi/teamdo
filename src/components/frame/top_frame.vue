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

<script>
export default {
  components: {}
}
</script>

<style lang="less" scoped>
.aui-content {
  min-height: 100vh;
}
</style>
