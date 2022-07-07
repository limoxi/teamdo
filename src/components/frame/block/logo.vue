<template>
  <div class="aui-logo">
    <b @click="onClickLogo">TeamDo</b>
    <Icon type="md-bulb" class="aui-helpBtn" v-if="showHelp"/>
  </div>
</template>

<script>
import {events, EventBus} from '@/service/event_bus'
export default {
  data() {
    return {
      showHelp: false
    }
  },
  created() {
    EventBus.on(events.HELP_REQUEST, helpText => {
      console.log('bingo~', helpText);
      this.showHelp = true;
    });
    EventBus.on('helpDone', () => {
      console.log('see you~');
      this.showHelp = false;
    });
  },
  methods: {
    onClickLogo() {
      this.$router.push({
        'name': 'index'
      });
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
