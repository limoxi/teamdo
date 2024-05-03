import {ref} from 'vue'
import {defineStore} from 'pinia'
import helper from '@/utils/helper'
import defaultAvatar from '@/assets/images/default-avatar.webp'
import Cookies from "js-cookie"
import {Message} from "view-ui-plus"
import {EventSourcePolyfill} from "event-source-polyfill"
import UserService from "@/business/user_service"

const useUserStore = defineStore('user', () => {
    let uid = ref(0)
    let nickname = ref('')
    let avatar = ref('')
    let roles = ref([])
    let sseStatus = ref('default')
    let sseClient = null

    const id2user = ref({})

    uid.value = helper.storage.get('uid') || 0
    nickname.value = helper.storage.get('nickname') || ''
    avatar.value = helper.storage.get('avatar') || defaultAvatar
    roles.value = helper.storage.get('roles') || []

    const updateSSEStatus = status => {
        sseStatus.value = status
    }

    const hasPerm = (perm) => {
        return roles.value.includes(perm)
    }

    const updateProfile = (updatedData) => {
        return UserService.updateUser(updatedData).then(() => {
            nickname.value = updatedData.nickname
            avatar.value = updatedData.avatar
            helper.storage.set('nickname', updatedData.nickname);
            helper.storage.set('avatar', updatedData.avatar);

            Message.success('修改信息成功~');
        }).catch(err => {
            Message.error(err.errMsg);
        });
    }

    const login = (phone, password) => {
        return UserService.doLogin(phone, password).then(loginUser => {
            uid.value = loginUser.id
            nickname.value = loginUser.nickname
            avatar.value = loginUser.avatar
            roles.value = loginUser.roles.split(',')

            helper.storage.set('uid', loginUser.id)
            helper.storage.set('nickname', loginUser.nickname)
            helper.storage.set('avatar', loginUser.avatar)
            helper.storage.set('roles', roles.value)
            Cookies.set('token', loginUser.token)

            initNotify()
            waitServerMessage()
        }).catch(err => {
            Message.error(err.errMsg)
        })
    }

    const initNotify = () => {
        if (!("Notification" in window)) {
            Message.warning("当前浏览器不支持桌面通知")
            return
        }
        if (!window.isSecureContext) {
            Message.warning('请使用https访问')
            return
        }
        if (Notification.permission !== 'granted') {
            Notification.requestPermission().then(permission => {
                if(permission !== 'granted') {
                    Message.warning('请打开桌面通知，以免漏接消息')
                }
            })
        }
    }
    const waitServerMessage = () => {
        sseClient = new EventSourcePolyfill('/iteamdo/message/user_realtime_message/', {
            headers: {
                'Authorization': Cookies.get('token'),
            },
            heartbeatTimeout: 5 * 60 * 60 * 1000  // 最大5小时
        })
        sseClient.onopen = event => {
            updateSSEStatus('success')
        }
        sseClient.onerror = event => {
            console.error(event)
            updateSSEStatus('error')
        }
        sseClient.addEventListener('ping', event => {
            updateSSEStatus('success')
        }, false)
        sseClient.addEventListener(`user_event_${uid.value}`, event => {
            updateSSEStatus('success')
            const eventData = JSON.parse(event.data)
            new Notification(eventData.title, {
                body: eventData.content,
                icon: location.origin + '/favicon.ico',
                requireInteraction: true
            })
        }, false)
    }

    const loadAllUsers = () => {
        UserService.getUsers().then(users => {
            users.forEach(user => {
                id2user.value[user.id] = user
            })
        })
    }

    const logout = () => {
        Cookies.remove('token');
        helper.storage.clear();
        if (sseClient) {
            sseClient.close()
        }
    }

    // 处理直接刷新页面后链接丢失问题，此处进行重连
    if (uid.value > 0) {
        waitServerMessage()
        loadAllUsers()
    }

    const getUser = userId => {
        return id2user.value[userId] || {
            avatar: '',
            nickname: '未知'
        }
    }

    return {
        uid,
        nickname,
        avatar,
        sseStatus,
        hasPerm,
        updateProfile,
        login,
        logout,
        getUser
    }
})

export default useUserStore
