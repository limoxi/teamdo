

import Resource from '@/utils/resource';

class LaneService {

    static getLanes(projectId, kanbanType) {
        return Resource.get({
            'resource': 'kanban.lanes',
            'data': {
                'project_id': projectId,
                'kanban_type': kanbanType
            }
        });
    }

    static addLane(projectId, kanbanType, newLane){
        return Resource.put({
            'resource': 'kanban.lane',
            'data': {
                'project_id': projectId,
                'kanban_type': kanbanType,
                'name': newLane.name,
                'wip': newLane.wip
            }
        });
    }

    static updateLane(projectId, newLane){
        return Resource.post({
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
        return Resource.delete({
            'resource': 'kanban.lane',
            'data': {
                'id': lane.id,
                'project_id': projectId
            }
        });
    }

    static resort(projectId, laneIds){
        return Resource.put({
            'resource': 'kanban.lane.resorted_lanes',
            'data': {
                'project_id': projectId,
                'ids': JSON.stringify(laneIds.map(lane =>{
                    return lane.id;
                }))
            }
        })
    }

    static getTasks(projectId, laneId){
        return Resource.get({
            'resource': 'kanban.lane.tasks',
            'data': {
                'project_id': projectId,
                'lane_id': laneId
            }
        })
    }
}

export default LaneService;