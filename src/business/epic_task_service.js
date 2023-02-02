import Resource from '@/utils/resource'
import EpicTask from "./model/epic";

class EpicTaskService {
    static async getEpicTasks(projectId, filters = null, withOptions = null, orderFields = null, page = null) {
        const data = {
            'project_id': projectId
        }
        if (filters) {
            data['filters'] = filters
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
            'resource': 'project.epic_tasks',
            'data': data
        })

        return {
            tasks: respData.tasks.map(taskData => new EpicTask(taskData)),
            page_info: respData.page_info
        }
    }

    static getEpicTask(projectId, taskId, withAll = true) {
        let data = {
            'project_id': projectId,
            'id': taskId
        };
        if (withAll) {
            data['with_options'] = {
                'with_users': true,
            }
        }

        return Resource.get({
            'resource': 'project.epic_task',
            'data': data
        })
    }

    static addEpicTask(projectId, task) {
        return Resource.put({
            'resource': 'project.epic_task',
            'data': {
                'project_id': parseInt(projectId),
                'name': task.name,
                'importance': task.importance,
                'desc': task.desc,
                'expected_finished_at': task.expectedFinishedAt,
                'meta_data': task.metaData,
                'tag_ids': task.tagIds
            }
        })
    }

    static updateEpicTask(projectId, task) {
        return Resource.post({
            'resource': 'project.epic_task',
            'data': {
                'project_id': projectId,
                'id': task.id,
                'name': task.name,
                'importance': task.importance,
                'desc': task.desc,
                'remark': task.remark,
                'expected_finished_at': task.expectedFinishedAt,
                'meta_data': task.metaData,
                'tag_ids': task.tagIds
            }
        })
    }

    static deleteEpicTask(projectId, taskId) {
        return Resource.delete({
            'resource': 'project.epic_task',
            'data': {
                'project_id': projectId,
                'id': taskId
            }
        })
    }

    static getEpicTaskLogs(projectId, taskId) {
        return Resource.get({
            'resource': 'project.task.logs',
            'data': {
                'project_id': projectId,
                'task_id': taskId,
                'with_options': {
                    'with_actor': true,
                }
            }
        })
    }

    static resort(projectId, taskId, beforeTaskId) {
        return Resource.put({
            resource: 'project.resorted_task',
            data: {
                project_id: projectId,
                task_id: taskId,
                before_task_id: beforeTaskId
            }
        })
    }
}

export default EpicTaskService
