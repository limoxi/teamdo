import Resource from '@/utils/resource';
import Task from "./model/task";
import EpicTask from "./model/epic";

class TaskService {

    static getTasks(projectId, filters = null, withOptions = null, orderFields = null, page = null) {
        let data = {
            'project_id': projectId,
            'filters': filters ?? {}
        }
        data.filters['category'] = 'normal'

        if (orderFields.length > 0) {
            data['order_fields'] = orderFields
        }

        if (page) {
            data['cur_page'] = page.cur_page;
            data['count_per_page'] = page.count_per_page;
        }

        if (withOptions) {
            data['with_options'] = withOptions;
        }

        return Resource.get({
            'resource': 'project.tasks',
            'data': data
        });
    }

    static async getTask(projectId, taskId, withAll = true) {
        let data = {
            'project_id': projectId,
            'task_id': taskId
        };
        if (withAll) {
            data['with_options'] = {
                'with_users': true,
                'with_tags': true
            }
        }

        const respData = await Resource.get({
            'resource': 'project.task',
            'data': data
        })
        if (respData.category === 'epic') {
            return new EpicTask(respData)
        }
        return new Task(respData)
    }

    static async addTask(projectId, task) {
        const respData = await Resource.put({
            'resource': 'project.task',
            'data': {
                'project_id': parseInt(projectId),
                'name': task.name,
                'importance': task.importance,
                'sp': task.sp,
                'assignor_id': task.assignorId,
                'parent_id': task.relatedTaskId,
                'desc': task.desc,
                'task_type': task.type,
                'tag_ids': task.tagIds
            }
        })
        return new Task(respData)
    }

    static async updateTask(projectId, task) {
        const respData = await Resource.post({
            'resource': 'project.task',
            'data': {
                'project_id': projectId,
                'id': task.id,
                'task_type': task.type,
                'name': task.name,
                'importance': task.importance,
                'sp': task.sp,
                'assignor_id': task.assignorId,
                'parent_id': task.relatedTaskId,
                'desc': task.desc,
                'tag_ids': task.tagIds
            }
        })
        return new Task(respData)
    }

    static deleteTask(projectId, taskId) {
        return Resource.delete({
            'resource': 'project.task',
            'data': {
                'project_id': projectId,
                'id': taskId
            }
        })
    }

    static setAssignorForTask(projectId, taskId, assignorId) {
        return Resource.put({
            'resource': 'project.task.assignor',
            'data': {
                'project_id': projectId,
                'task_id': taskId,
                'assignor_id': assignorId
            }
        })
    }

    static getTaskLogs(projectId, taskId) {
        return Resource.get({
            'resource': 'project.task.logs',
            'data': {
                'project_id': projectId,
                'task_id': taskId,
                'with_options': {
                    'with_actor': true,
                    'with_lane': true
                }
            }
        })
    }

    static switchTaskFlashing(projectId, taskId, switchOn) {
        let method = 'put'
        if (!switchOn) {
            method = 'delete'
        }
        return Resource[method]({
            'resource': 'project.flashing_task',
            'data': {
                'project_id': projectId,
                'task_id': taskId
            }
        })
    }
}

export default TaskService;