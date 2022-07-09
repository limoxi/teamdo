import Resource from '@/utils/resource';

class TaskService {

  static getIntType(type) {
    return {
      'kanban': 0,
      'sprint': 1
    }[type]
  }

  static getTasks(projectId, filters = null, withOptions = null, orderFields = null, page = null) {
    let data = {
      'project_id': projectId
    }
    if (filters) {
      data['filters'] = filters
    }

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

  static getTask(projectId, taskId) {
    let data = {
      'project_id': projectId,
      'task_id': taskId,
      'with_options': {
        'with_detail': true,
        'with_users': true
      }
    };

    return Resource.get({
      'resource': 'project.task',
      'data': data
    })
  }

  static addTask(projectId, task) {
    return Resource.put({
      'resource': 'project.task',
      'data': {
        'project_id': parseInt(projectId),
        'name': task.name,
        'importance': task.importance,
        'desc': JSON.stringify(task.desc),
        'NUT': task.NUT
      }
    })
  }

  static addSubTask(projectId, task, parentTask) {
    return Resource.put({
      'resource': 'task.sub_task',
      'data': {
        'project_id': projectId,
        'task_id': parentTask.id,
        'name': task.name,
        'desc': task.desc
      }
    })
  }

  static updateTask(projectId, task) {
    return Resource.post({
      'resource': 'project.task',
      'data': {
        'project_id': projectId,
        'id': task.id,
        'name': task.name,
        'importance': task.importance,
        'desc': task.desc,
        'NUT': task.NUT
      }
    })
  }

  static appendToKanban(projectId, kanbanType, taskId) {
    return Resource.put({
      'resource': 'kanban.rookie_task',
      'data': {
        'project_id': parseInt(projectId),
        'kanban_type': this.getIntType(kanbanType),
        'task_id': taskId
      }
    });
  }

  static switchLane(projectId, task, targetLaneId) {
    return Resource.put({
      'resource': 'project.shuttled_task',
      'data': {
        'project_id': parseInt(projectId),
        'task_id': task.id,
        'target_lane_id': targetLaneId
      }
    });
  }

  static finish(projectId, task) {
    return Resource.put({
      'resource': 'task.finished_task',
      'data': {
        'project_id': projectId,
        'task_id': task.id
      }
    });
  }

  static undoTask(projectId, task) {
    return Resource.put({
      'resource': 'task.undid_task',
      'data': {
        'project_id': projectId,
        'task_id': task.id
      }
    })
  }

  static abortTask(projectId, task) {
    return Resource.put({
      'resource': 'task.aborted_task',
      'data': {
        'project_id': projectId,
        'task_id': task.id
      }
    })
  }
}

export default TaskService;
