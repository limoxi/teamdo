import Resource from '@/utils/resource';
import Task from "./model/task";

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

    static async getUserTasks(filters, page, orderFields = null) {
        let data = {
            'filters': filters || {},
            'with_options': {
                'with_tags': true,
                'with_users': true,
                'with_progress': true,
                'with_project': true
            },
            'cur_page': page.curPage,
            'page_size': page.pageSize,
        }
        if (orderFields.length > 0) {
            data['order_fields'] = orderFields
        }

        const respData = await Resource.get({
            'resource': 'user.projects_tasks',
            'data': data
        });
        return {
            tasks: respData.tasks.map(task => new Task(task)),
            pageInfo: respData.page_info
        }
    }


    static async getUserJoinedTasks(filters = null, withOptions = null, orderFields = null, page = null, userId = 0) {
        let data = {
            'user_id': userId,
            'filters': filters ?? {}
        }
        if (orderFields.length > 0) {
            data['order_fields'] = orderFields
        }

        if (page) {
            data['cur_page'] = page.curPage;
            data['page_size'] = page.pageSize;
        }

        if (withOptions) {
            data['with_options'] = withOptions;
        }

        const respData = await Resource.get({
            'resource': 'user.joined_tasks',
            'data': data
        });
        return {
            tasks: respData.tasks.map(task => new Task(task)),
            pageInfo: respData.page_info
        }
    }

    static resortUserTask(taskId, beforeTaskId) {
        return Resource.put({
            resource: 'user.resorted_task',
            data: {
                task_id: taskId,
                before_task_id: beforeTaskId
            }
        })
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
                'assignor_ids': task.assignorIds,
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
                'assignor_ids': task.assignorIds,
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

    static setAssignorsForTask(projectId, taskId, assignorIds) {
        return Resource.post({
            'resource': 'project.task.assignors',
            'data': {
                'project_id': projectId,
                'task_id': taskId,
                'assignor_ids': assignorIds
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

    static shareTaskToProject(projectId, taskId, targetProjectId) {
        return Resource.put({
            'resource': 'project.shared_task',
            'data': {
                'project_id': projectId,
                'target_project_id': targetProjectId,
                'task_id': taskId
            }
        })
    }
}

export default TaskService;
