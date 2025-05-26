<template>
  <div class="aui-loader">
  </div>
</template>

<script setup>

</script>

<style scoped lang="less">

.aui-loader {
  display: inline-block;
  position: relative;
}

.aui-loader::after,
.aui-loader::before {
  opacity: 0;
  content: '';
  box-sizing: border-box;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #333;
  position: absolute;
  left: 0;
  top: 0;
  animation: ll 2s linear infinite;
}

.aui-loader::after {
  animation-delay: 1s;
}

@keyframes ll {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}


</style>