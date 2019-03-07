

import Resource from '@/utils/resource';

class TaskService {

    static getTasks(projectId){
        return Resource.use('iscrum').get({
            'resource': 'task.tasks',
            'data': {
                'project_id': projectId
            }
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

    static switchLane(projectId, task, targetLane){
        return Resource.use('iscrum').put({
            'resource': 'kanban.lane.swimming_task',
            'data': {
                'project_id': projectId,
                'task_id': task.id,
                'target_lane_id': targetLane.id
            }
        });
    }
}

export default TaskService;