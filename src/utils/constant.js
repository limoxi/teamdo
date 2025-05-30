const colors = ['#2b85e4', '#19be6b', '#ff9900', '#ed4014', '#17233d']

const importanceOptions = [
    {
        'label': '1(一般)',
        'value': '1'
    }, {
        'label': '2',
        'value': '2'
    }, {
        'label': '3',
        'value': '3'
    }, {
        'label': '4(紧急)',
        'value': '4'
    }, {
        'label': '5',
        'value': '5'
    }, {
        'label': '6',
        'value': '6'
    }, {
        'label': '7(非常紧急)',
        'value': '7'
    }, {
        'label': '8',
        'value': '8'
    }, {
        'label': '9',
        'value': '9'
    }
]

const taskType2Name = {
    'REQ': '需求',
    'OPT': '优化',
    'BUG': 'BUG'
}

const taskType2Color = {
    'REQ': 'primary',
    'OPT': 'warning',
    'BUG': 'error'
}

const taskTypeOptions = [{
    'label': taskType2Name['REQ'],
    'value': 'REQ'
}, {
    'label': taskType2Name['OPT'],
    'value': 'OPT'
}, {
    'label': taskType2Name['BUG'],
    'value': 'BUG'
}]

const getImportanceDesc = (imp) => {
    let str = '';
    if (imp <= 3) {
        str = '一般';
    } else if (imp <= 6) {
        str = '紧急';
    } else if (imp <= 9) {
        str = '非常紧急';
    }
    return str;
}

const getImportanceColor = (imp) => {
    if (imp <= 3) {
        return '#2b85e4'
    } else if (imp <= 6) {
        return '#ff9900'
    } else if (imp <= 9) {
        return '#ed4014'
    }
    return '#2b85e4'
}

const getStatusColor = (statusText) => {
    switch (statusText) {
        case '未开始':
            return '#ff9900'
        case '进行中':
            return '#19be6b'
        case '已完成':
            return '#2b85e4'
        case '已放弃':
            return '#808695'
        case 0:
            return '#ff9900'
        case 1:
            return '#19be6b'
        case 2:
            return '#2b85e4'
        case 3:
            return '#808695'
        default:
            return '#ff9900'
    }
}

const TASK_STATUS_NOT_START = 0  // 未开始
const TASK_STATUS_WORKING = 1  // 进行中
const TASK_STATUS_FINISHED = 2  // 已完成
const TASK_STATUS_ABORT = 3  // 已废弃

const taskStatus2Num = (statusText) => {
    switch (statusText){
        case 'not_start':
            return TASK_STATUS_NOT_START
        case 'working':
            return TASK_STATUS_WORKING
        case 'finished':
            return TASK_STATUS_FINISHED
        case 'abort':
            return TASK_STATUS_ABORT
    }
    return -1
}

const taskStatus2Text = (statusNum) => {
    switch (statusNum){
        case TASK_STATUS_NOT_START:
            return '未开始'
        case TASK_STATUS_WORKING:
            return '进行中'
        case TASK_STATUS_FINISHED:
            return '已完成'
        case TASK_STATUS_ABORT:
            return '已废弃'
    }
    return 'unknown'
}

export {
    colors,
    importanceOptions,
    taskTypeOptions,
    taskType2Name,
    taskType2Color,
    taskStatus2Num,
    taskStatus2Text,
    getImportanceDesc,
    getImportanceColor,
    getStatusColor
}
