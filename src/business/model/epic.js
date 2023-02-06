import {inject} from "vue";
import defaultAvatar from '@/assets/images/default-avatar.webp';

class EpicTask {
    constructor(taskData = undefined) {
        this.id = taskData?.id ?? 0
        this.creatorId = taskData?.creator_id ?? 0
        this.name = taskData?.name ?? ''
        this.importance = taskData?.importance ?? 0
        this.desc = taskData?.desc ?? ''
        this.tags = taskData?.tags ?? []
        this.expectedFinishedAt = taskData?.expected_finished_at ?? ''
        this.updatedAt = taskData?.updated_at ?? taskData?.created_at
        this.createdAt = taskData?.created_at ?? ''
        this.docLink = taskData?.meta_data?.doc_link ?? ''
        this.designLink = taskData?.meta_data?.design_link ?? ''
        this.status = taskData?.status ?? '未知'

        // need fill
        this.creatorFilled = false
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

        this.children = []
        this.childrenCount = 0
        this.childrenStats = {
            'notStart': 0,
            'working': 0,
            'finished': 0,
            'remain': 0
        }
        for (const child of taskData?.children ?? []) {
            const lintChild = {
                id: child.id,
                laneId: child.lane_id,
                status: child.status
            }
            switch (child.status) {
                case "未开始":
                    this.childrenStats.notStart += 1
                    this.childrenStats.remain += 1
                    this.childrenCount += 1
                    this.children.push(lintChild)
                    break
                case "进行中":
                    this.childrenStats.working += 1
                    this.childrenStats.remain += 1
                    this.childrenCount += 1
                    this.children.push(lintChild)
                    break
                case "已完成":
                    this.childrenStats.finished += 1
                    this.childrenCount += 1
                    this.children.push(lintChild)
                    break
            }
        }
    }

    isEpicTask() {
        return true
    }

    getProgress() {
        switch (this.status) {
            case '已完成':
                return 100
            case '未开始':
                return 0
            case '已放弃':
                return 0
            default:
                const project = inject('project')
                const lifeTime = project.value.getLifeTimeOfLanes()
                let tProgress = 0
                let tCount = 0
                let allChildrenFinished = true
                for(const child of this.children) {
                    tCount += 1
                    switch (this.status) {
                        case '已完成':
                            tProgress += 100
                            break
                        case '已放弃':
                            tCount -= 1
                            continue
                    }

                    allChildrenFinished = false
                    const laneIndex = project.value.lanes.findIndex(lane => lane.id === child.laneId)
                    tProgress = Math.round((laneIndex + 1) / lifeTime * 100)
                }

                if (allChildrenFinished) {
                    return 100
                }
                let progress = Math.round(tProgress / tCount)
                if (progress > 100) {
                    progress = 100
                }
                return progress
        }

    }

    getCreator() {
        if (this.creatorFilled) {
            return this.creator
        }
        const project = inject('project')
        for (const pu of project.value.users) {
            if (pu.id === this.creatorId) {
                this.creatorFilled = true
                this.creator = pu
                break
            }
        }
        return this.creator
    }
}

export default EpicTask
