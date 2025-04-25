class Task {
    constructor(taskData = undefined) {
        this.id = taskData?.id ?? 0
        this.type = taskData?.type ?? 'REQ'
        this.typeName = taskData?.type_name ?? '需求'
        this.parentId = taskData?.parent_id ?? 0
        this.parentCategory = taskData?.parent_category ?? ''
        this.creatorId = taskData?.creator_id ?? 0
        this.assignorIds = taskData?.assignor_ids ?? []
        this.flashing = taskData?.flashing ?? false
        this.name = taskData?.name ?? ''
        this.importance = taskData?.importance ?? 0
        this.sp = taskData?.sp ?? 0
        this.passedSp = taskData?.passed_sp ?? 0
        this.duration = taskData?.duration ?? 0
        this.currLaneDuration = taskData?.current_lane_duration ?? 0
        this.desc = taskData?.desc ?? ''
        this.hasDesc = taskData?.has_desc ?? false
        this.attentions = taskData?.attentions ?? []
        this.hasAttention = taskData?.has_attention ?? false
        this.expectedFinishedAt = taskData?.expected_finished_at ?? ''
        this.updatedAt = taskData?.updated_at ?? taskData?.created_at
        this.createdAt = taskData?.created_at ?? ''
        this.status = taskData?.status ?? '未知'
        this.laneId = taskData?.lane_id ?? 0
        this.laneName = ''
        this.progress = taskData?.progress ?? 0
        this.isReplica = taskData?.is_replica ?? false

        if (this.expectedFinishedAt) {
            this.expectedFinishedAt = this.expectedFinishedAt.slice(0, -3)
        }

        this.tags = taskData?.tags ?? []
        this.users = taskData?.users ?? []
        this.lane = taskData?.lane ?? {}

        this.projectId = taskData?.project_id ?? 0
        if (taskData?.project) {
            this.project = taskData.project
            this.project.lanes.forEach(lane => {
                if (lane.id === this.laneId) {
                    this.laneName = lane.name
                }
            })
        }
    }

    isEpicTask() {
        return false
    }

    isFinished() {
        return this.status === '已完成'
    }

    addAssignor(assignorId) {
        if (this.assignorIds.includes(assignorId)) {
            return
        }
        this.assignorIds.push(assignorId)
    }

    setAssignors(assignorIds) {
        this.assignorIds = assignorIds
    }

    setTags(tags) {
        this.tags = tags
    }

}

export default Task
