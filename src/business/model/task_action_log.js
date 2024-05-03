import Task from '@/business/model/task'

class TaskActionLog {
    constructor(data = undefined) {
        this.id = data?.id ?? 0
        this.operatorId = data?.operator_id ?? 0
        this.fromLaneId = data?.from_lane_id ?? 0
        this.toLaneId = data?.to_lane_id ?? 0
        this.action = data?.action ?? ''
        this.actionCN = data?.action_cn ?? ''
        this.actionData = data?.action_data ?? {}
        this.createdAt = data?.created_at ?? ''

        this.fromLane = data?.from_lane ?? null
        this.toLane = data?.to_lane ?? null
        this.operator = data?.operator ?? null
    }

    getLaneSwitchDirection () {
        let direction = this.actionData['lane_switch_direction'] ?? ''
        if (direction !== '') {
            return direction
        }

        direction = 'stay'
        if (this.fromLaneId === 0 && this.toLaneId > 0){
            direction = 'forward'
        }
        if (this.fromLaneId && this.toLane) {
            if (this.fromLane.display_index < this.toLane.display_index) {
                direction = 'backward'
            }
        }
        return direction
    }

    getRemark () {
        return this.actionData['remark'] ?? ''
    }

    getActionText () {
        let actionText = this.actionCN
        let extraText = ''
        switch (this.action) {
            case 'update':
                extraText = this.actionData['detail'] ?? ''
                extraText = extraText.replaceAll('name', '描述')
                extraText = extraText.replaceAll('type', '类型')
                extraText = extraText.replaceAll('desc', '详细描述')
                extraText = extraText.replaceAll('importance', '优先级')
                extraText = extraText.replaceAll('sp', '故事点')
                extraText = extraText.replaceAll('assignor_id', '执行者')
                break
            case 'switch_lane':
                switch (this.getLaneSwitchDirection()){
                    case 'stay':
                        extraText = ''
                        break
                    case 'forward':
                        extraText = '前进'
                        break
                    case 'backward':
                        extraText = '后退'
                        break
                }
        }
        if (extraText !== '') {
            actionText = `${actionText}：${extraText}`
        }
        return actionText
    }

}

export default TaskActionLog