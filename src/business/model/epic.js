import defaultAvatar from '@/assets/images/default-avatar.webp'
import {useUserStore} from "@/store"

class EpicTask {
  constructor(taskData = undefined) {
    this.id = taskData?.id ?? 0
    this.type = taskData?.type ?? 'REQ'
    this.laneId = taskData?.lane_id ?? 0
    this.creatorId = taskData?.creator_id ?? 0
    this.name = taskData?.name ?? ''
    this.importance = taskData?.importance ?? 0
    this.hasDesc = taskData?.has_desc ?? false
    this.desc = taskData?.desc ?? ''
    this.tags = taskData?.tags ?? []
    this.expectedFinishedAt = taskData?.expected_finished_at ?? ''
    this.updatedAt = taskData?.updated_at ?? taskData?.created_at
    this.createdAt = taskData?.created_at ?? ''
    this.docLink = taskData?.meta_data?.doc_link ?? ''
    this.designLink = taskData?.meta_data?.design_link ?? ''
    this.status = taskData?.status ?? '未知'
    this.progress = taskData?.progress ?? 0
    this.isReplica = taskData?.is_replica ?? false

    // need fill
    this.creator = {
      id: this.creatorId,
      name: '未知',
      avatar: defaultAvatar
    }

    this.fromWhere = '未知'
    if (this.tags.length > 0) {
      this.fromWhere = this.tags[0].name
    }

    if (this.expectedFinishedAt) {
      this.expectedFinishedAt = this.expectedFinishedAt.slice(0, -3)
    }

    this.isParent = taskData?.is_parent ?? false

    this.children = []  // deprecated
  }

  isEpicTask() {
    return true
  }

  getCreator() {
    const userStore = useUserStore()
    this.creator = userStore.getUser(this.creatorId)
    return this.creator
  }
}

export default EpicTask
