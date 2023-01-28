import Resource from '@/utils/resource';

class TagService {

    static getTagsForProject(projectId, bizCode = 'normal_task') {
        return Resource.get({
            'resource': 'project.tags',
            'data': {
                'project_id': projectId,
                'biz_code': bizCode
            }
        })
    }

    static addTag(projectId, bizCode, name, color) {
        return Resource.put({
            'resource': 'project.tag',
            'data': {
                'project_id': projectId,
                'biz_code': bizCode,
                'name': name,
                'color': color
            }
        })
    }

    static updateTag(projectId, taskId, name, color) {
        return Resource.post({
            'resource': 'project.tag',
            'data': {
                'project_id': projectId,
                'id': taskId,
                'name': name,
                'color': color
            }
        })
    }

    static deleteTag(projectId, tagId) {
        return Resource.delete({
            'resource': 'project.tag',
            'data': {
                'project_id': projectId,
                'id': tagId
            }
        })
    }

}

export default TagService
