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

export {
    colors,
    importanceOptions,
    taskTypeOptions,
    taskType2Name,
    getImportanceDesc
}
