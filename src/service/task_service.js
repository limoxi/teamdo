

import Resource from '@/utils/resource';

class TaskService {

    static getTasks(projectId, filters=null, withOptions=null, orderFields=null, page=null){
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

        if(withOptions){
            data['with_options'] = JSON.stringify(withOptions);
        }

        return Resource.get({
            'resource': 'task.tasks',
            'data': data
        });
    }

    static getTask(projectId, taskId){
        let data = {
            'project_id': projectId,
            'task_id': taskId,
            'with_options': JSON.stringify({
                'with_detail': true
            })
        };

        return Resource.get({
            'resource': 'task.task',
            'data': data
        });
    }

    static addTask(projectId, task){
        return Resource.put({
            'resource': 'task.task',
            'data': {
                'project_id': projectId,
                'name': task.name,
                'importance': task.importance,
                'desc': task.desc,
                'need_id': task.need_id,
                'NUT': task.NUT
            }
        })
    }

    static addSubTask(projectId, task, parentTask){
        return Resource.put({
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
        return Resource.post({
            'resource': 'task.task',
            'data': {
                'project_id': projectId,
                'id': task.id,
                'name': task.name,
                'importance': task.importance,
                'desc': task.desc,
                'NUT': task.NUT
            }
        })
    }

    static appendToKanban(projectId, type, taskId){
        return Resource.put({
            'resource': 'kanban.lane_task',
            'data': {
                'project_id': projectId,
                'kanban_type': type,
                'task_id': taskId
            }
        });
    }

    static switchLane(projectId, task, targetLaneId){
        return Resource.put({
            'resource': 'kanban.lane.swimming_task',
            'data': {
                'project_id': projectId,
                'task_id': task.id,
                'target_lane_id': targetLaneId
            }
        });
    }

    static finish(projectId, task){
        return Resource.put({
            'resource': 'task.finished_task',
            'data': {
                'project_id': projectId,
                'task_id': task.id
            }
        });
    }

    static finishSubTask(projectId, task){
        return Resource.put({
            'resource': 'task.finished_sub_task',
            'data': {
                'project_id': projectId,
                'task_id': task.id
            }
        })
    }

    static undoTask(projectId, task){
        return Resource.put({
            'resource': 'task.undid_task',
            'data': {
                'project_id': projectId,
                'task_id': task.id
            }
        })
    }

    static abortTask(projectId, task){
        return Resource.put({
            'resource': 'task.aborted_task',
            'data': {
                'project_id': projectId,
                'task_id': task.id
            }
        })
    }
}

export default TaskService;