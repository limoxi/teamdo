import Resource from '@/utils/resource'
import EpicTask from './model/epic'

class EpicTaskService {
    static async getEpicTasks(projectId, laneId, filters = null, withOptions = null, orderFields = [], page = null) {
        const data = {
            'project_id': projectId,
            'lane_id': laneId
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
            'resource': 'project.epic.lane_tasks',
            'data': data
        })

        return {
            tasks: respData.tasks.map(taskData => new EpicTask(taskData)),
            page_info: respData.page_info
        }
    }

    static async getEpicTask(projectId, taskId, withAll = true) {
        let data = {
            'project_id': projectId,
            'id': taskId
        };
        if (withAll) {
            data['with_options'] = {
                'with_users': true,
                'with_tags': true,
                'with_progress': true
            }
        }

        const respData = await Resource.get({
            'resource': 'project.epic_task',
            'data': data
        })
        return new EpicTask(respData)
    }

    static async addEpicTask(projectId, task) {
        projectId = parseInt(projectId)
        const respData = await Resource.put({
            'resource': 'project.epic_task',
            'data': {
                'project_id': projectId,
                'before_task_id': task.beforeTaskId,
                'name': task.name,
                'importance': task.importance,
                'desc': task.desc,
                'expected_finished_at': task.expectedFinishedAt,
                'meta_data': task.metaData,
                'tag_ids': task.tagIds
            }
        })
        const newTaskId = respData.id
        return EpicTaskService.getEpicTask(projectId, newTaskId)
    }

    static async updateEpicTask(projectId, task) {
        await Resource.post({
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
        return EpicTaskService.getEpicTask(projectId, task.id)
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

    static resortToTop(projectId, taskId) {
        return Resource.put({
            resource: 'project.resorted_task',
            data: {
                project_id: projectId,
                task_id: taskId,
                before_task_id: -1
            }
        })
    }

    static resortToBottom(projectId, taskId) {
        return Resource.put({
            resource: 'project.resorted_task',
            data: {
                project_id: projectId,
                task_id: taskId,
                before_task_id: 0
            }
        })
    }
}

export default EpicTaskService
