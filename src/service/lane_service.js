

import Resource from '@/utils/resource';

class LaneService {

    static getLanes(projectId, kanbanId) {
        return Resource.use('iscrum').get({
            'resource': 'kanban.lanes',
            'data': {
                'project_id': projectId,
                'kanban_id': kanbanId
            }
        });
    }

    static updateLane(projectId, newLane){
        return Resource.use('iscrum').post({
            'resource': 'kanban.lane',
            'data': {
                'id': newLane.id,
                'project_id': projectId,
                'name': newLane.name,
                'max_task_count': newLane.max_task_count
            }
        });
    }
}

export default LaneService;