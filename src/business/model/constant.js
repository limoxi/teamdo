
const KANBAN_TYPE_KANBAN = 'kanban'
const KANBAN_TYPE_EPIC = 'epic'
const KANBAN_TYPE_WORK = 'work'
const KANBAN_TYPES = [KANBAN_TYPE_KANBAN, KANBAN_TYPE_EPIC, KANBAN_TYPE_WORK]

const isKanbanType = kt => {
    return kt === KANBAN_TYPE_KANBAN
}
const isEpicType = kt => {
    return kt === KANBAN_TYPE_EPIC
}
const isWorkType = kt => {
    return kt === KANBAN_TYPE_WORK
}

const LANE_DISPLAY_MODE_CARD = 'card'
const LANE_DISPLAY_MODE_LIST = 'list'

export {
    KANBAN_TYPE_KANBAN,
    KANBAN_TYPE_EPIC,
    KANBAN_TYPE_WORK,
    KANBAN_TYPES,
    isKanbanType,
    isEpicType,
    isWorkType,
    LANE_DISPLAY_MODE_CARD,
    LANE_DISPLAY_MODE_LIST
}