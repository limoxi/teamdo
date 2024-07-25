<template>
  <div class="aui-logo">
    <b @click="onClickLogo">TeamDo</b>
    <Icon type="md-bulb" class="aui-helpBtn" v-if="showHelp"/>
  </div>
</template>

<script>
import {Icon} from 'view-ui-plus'

export default {
  components: {Icon},
  data() {
    return {
      showHelp: false
    }
  },
  methods: {
    onClickLogo() {
      this.$router.push({
        'name': 'projects'
      })
    }
  }
}
</script>

<style scoped lang="less">
.aui-logo {
  b {
    font-family: teamdo;
    font-size: 32px;
    cursor: pointer;
    font-weight: normal;
  }

  .aui-helpBtn {
    position: fixed;
    top: 5px;
    left: 130px;
    color: #fff200;
    font-size: 20px;
  }
}
</style>
