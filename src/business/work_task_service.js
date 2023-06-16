import Resource from '@/utils/resource'
import WorkTask from "./model/work";

class WorkTaskService {
    static async getWorkTasks(projectId, filters = null, withOptions = null, orderFields = null, page = null) {
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
            'resource': 'project.work_tasks',
            'data': data
        })

        return {
            tasks: respData.tasks.map(taskData => new WorkTask(taskData)),
            page_info: respData.page_info
        }
    }

    static async getWorkTask(projectId, taskId, withAll = true) {
        let data = {
            'project_id': projectId,
            'id': taskId
        };
        if (withAll) {
            data['with_options'] = {
                'with_users': true,
                'with_tags': true
            }
        }

        const respData = await Resource.get({
            'resource': 'project.epic_task',
            'data': data
        })
        return new WorkTask(respData)
    }

    static addWorkTask(projectId, task) {
        return Resource.put({
            'resource': 'project.work_task',
            'data': {
                'project_id': parseInt(projectId),
                'before_task_id': task.beforeTaskId,
                'name': task.name,
                'importance': task.importance,
                'desc': task.desc,
                'expected_finished_at': task.expectedFinishedAt,
                'meta_data': task.metaData,
                'tag_ids': task.tagIds
            }
        })
    }

    static updateWorkTask(projectId, task) {
        return Resource.post({
            'resource': 'project.work_task',
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

    static deleteWorkTask(projectId, taskId) {
        return Resource.delete({
            'resource': 'project.work_task',
            'data': {
                'project_id': projectId,
                'id': taskId
            }
        })
    }
}

export default WorkTaskService
