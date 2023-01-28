class Task {
    constructor(taskData = undefined) {
        this.id = taskData?.id ?? 0
        this.type = taskData?.type ?? 'REQ'
        this.typeName = taskData?.type_name ?? '需求'
        this.parentId = taskData?.parent_id ?? 0
        this.parentType = taskData?.parent_type ?? ''
        this.creatorId = taskData?.creator_id ?? 0
        this.assignorId = taskData?.assignor_id ?? 0
        this.flashing = taskData?.flashing ?? false
        this.name = taskData?.name ?? ''
        this.importance = taskData?.importance ?? 0
        this.sp = taskData?.sp ?? 0
        this.passedSp = taskData?.passed_sp ?? 0
        this.desc = taskData?.desc ?? ''
        this.hasDesc = taskData?.has_desc ?? false
        this.attentions = taskData?.attentions ?? []
        this.hasAttention = taskData?.has_attention ?? false
        this.expectedFinishedAt = taskData?.expected_finished_at ?? ''
        this.updatedAt = taskData?.updated_at ?? taskData?.created_at
        this.createdAt = taskData?.created_at ?? ''
        this.status = taskData?.status ?? '未知'
        this.laneId = taskData?.lane_id ?? 0

        if (this.expectedFinishedAt) {
            this.expectedFinishedAt = this.expectedFinishedAt.slice(0, -3)
        }

        this.tags = taskData?.tags ?? []
        this.users = taskData?.users ?? []
    }

    isEpicTask() {
        return false
    }

}

export default Task
