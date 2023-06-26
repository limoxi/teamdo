import Resource from '@/utils/resource';

class BotService {

    static getAllBots() {
        return Resource.get({
            'resource': 'bot.bots',
            'data': {}
        })
    }

    static addBot(name, token, avatar, remark) {
        return Resource.put({
            'resource': 'bot.bot',
            'data': {
                'name': name,
                'token': token,
                'avatar': avatar,
                'remark': remark
            }
        })
    }

    static updateBot(id, name, avatar, remark) {
        return Resource.post({
            'resource': 'bot.bot',
            'data': {
                'id': id,
                'name': name,
                'avatar': avatar,
                'remark': remark
            }
        })
    }

    static deleteBot(id) {
        return Resource.delete({
            'resource': 'bot.bot',
            'data': {
                'id': id
            }
        })
    }

}

export default BotService
