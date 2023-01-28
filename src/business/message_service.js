import Resource from '@/utils/resource';

class MessageService {

  static sendMessage(projectId, botId, title, type, content, userIds) {
    return Resource.put({
      'resource': 'project.message',
      'data': {
        'project_id': projectId,
        'bot_id': botId,
        'title': title,
        'type': type,
        'content': encodeURI(content),
        'at_user_ids': userIds
      }
    })
  }

}

export default MessageService
