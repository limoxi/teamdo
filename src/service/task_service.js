

import Resource from '@/utils/resource';

class TaskService {

    static getTasks(projectId, filters=null, orderFields=null, page=null){
        let data = {
            'project_id': projectId
        }
        if(filters){
            data['filters'] = JSON.stringify(filters)
        }

        if(orderFields.length > 0){
            data['order_fields'] = JSON.stringify(orderFields)
        }

        if(page){
            data['cur_page'] = page.cur_page;
            data['count_per_page'] = page.count_per_page;
        }

        return Resource.use('iscrum').get({
            'resource': 'task.tasks',
            'data': data
        });
    }

    static addTask(projectId, task){
        return Resource.use('iscrum').put({
            'resource': 'task.task',
            'data': {
                'project_id': projectId,
                'name': task.name,
                'importance': task.importance,
                'desc': task.desc,
                'need_id': task.need_id,
                'tags': task.tags.join(',')
            }
        })
    }

    static addSubTask(projectId, task, parentTask){
        return Resource.use('iscrum').put({
            'resource': 'task.sub_task',
            'data': {
                'project_id': projectId,
                'task_id': parentTask.id,
                'name': task.name,
                'desc': task.desc
            }
        })
    }

    static updateTask(projectId, task){
        return Resource.use('iscrum').post({
            'resource': 'task.task',
            'data': {
                'project_id': projectId,
                'id': task.id,
                'name': task.name,
                'importance': task.importance,
                'desc': task.desc,
                'tags': task.tags.join(',')
            }
        })
    }

    static appendToKanban(projectId, type, taskId){
        return Resource.use('iscrum').put({
            'resource': 'kanban.lane_task',
            'data': {
                'project_id': projectId,
                'kanban_type': type,
                'task_id': taskId
            }
        });
    }

    static switchLane(projectId, task, targetLaneId){
        return Resource.use('iscrum').put({
            'resource': 'kanban.lane.swimming_task',
            'data': {
                'project_id': projectId,
                'task_id': task.id,
                'target_lane_id': targetLaneId
            }
        });
    }

    static finish(projectId, task){
        return Resource.use('iscrum').put({
            'resource': 'task.finished_task',
            'data': {
                'project_id': projectId,
                'task_id': task.id
            }
        });
    }

    static undoTask(projectId, task){
        return Resource.use('iscrum').put({
            'resource': 'task.undid_task',
            'data': {
                'project_id': projectId,
                'task_id': task.id
            }
        })
    }

    static abortTask(projectId, task){
        return Resource.use('iscrum').put({
            'resource': 'task.aborted_task',
            'data': {
                'project_id': projectId,
                'task_id': task.id
            }
        })
    }
}

export default TaskService;