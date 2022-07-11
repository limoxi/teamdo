<template>
  <Avatar v-if="!avatar" :src="avatar" shape="square" style="transform: scale(1.2)"/>
  <Avatar v-else :style="{backgroundColor: randomColor()}" shape="square">{{nickname[0]}}</Avatar>
</template>

<script setup>

const props = defineProps(['avatar', 'nickname'])
const randomColor = () => {

}

</script>

<style scoped>

</style>
