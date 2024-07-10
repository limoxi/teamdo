<template>
  <div class="aui-lane aui-empty-lane">
    <div class="aui-card" @click="onAddLane">
      <div class="aui-i-content">
        <Icon type="md-add" />
        <strong>增加泳道</strong>
      </div>
    </div>
  </div>
</template>

<script setup>
import {computed, inject, onMounted, ref} from 'vue'
import {useModalStore} from '@/store'
import LaneModal from '@/components/modal/lane_modal.vue'
import {Icon} from 'view-ui-plus'

const modalStore = useModalStore()
const emit = defineEmits(['onChangeDisplayMode'])
const props = defineProps(['kanban'])
const project = inject('project')
const projectId = inject('projectId')

onMounted(() => {
})

const onAddLane = () => {
  modalStore.show('laneModal', {
    'projectId': projectId,
    'kanbanId': props.kanban.id,
    'mode': 'create'
  })
}

</script>

<style scoped lang="less">
.aui-lane {
  outline: 0;
  width: 280px;
  padding: 5px 5px 5px;
  margin: 5px;
  border-radius: 5px;

  .aui-card{
    height: 100%;
    overflow: hidden;
  }

  .aui-i-content{
    cursor: pointer;
    height: 100%;
    font-size: 18px;
    text-align: center;
    margin-top: 48%;
  }

}
.aui-empty-lane{
  border: 2px dashed black;
}
</style>
