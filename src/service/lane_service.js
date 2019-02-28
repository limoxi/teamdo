

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

    static addLane(projectId, kanbanId, newLane){
        return Resource.use('iscrum').put({
            'resource': 'kanban.lane',
            'data': {
                'project_id': projectId,
                'kanban_id': kanbanId,
                'name': newLane.name,
                'wip': newLane.wip
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
                'wip': newLane.wip
            }
        });
    }

    static deleteLane(projectId, lane){
        return Resource.use('iscrum').delete({
            'resource': 'kanban.lane',
            'data': {
                'id': lane.id,
                'project_id': projectId
            }
        });
    }

    static resort(projectId, laneIds){
        return Resource.use('iscrum').put({
            'resource': 'kanban.lane.resorted_lanes',
            'data': {
                'project_id': projectId,
                'ids': JSON.stringify(laneIds.map(lane =>{
                    return lane.id;
                }))
            }
        })
    }
}

export default LaneService;