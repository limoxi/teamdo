import {ref} from 'vue'
import {defineStore} from 'pinia'
import helper from '@/utils/helper'
import defaultAvatar from '@/images/default-avatar.webp'
import Cookies from "js-cookie";

const useUserStore = defineStore('user',() => {
  let uid = ref(0)
  let nickname = ref('')
  let avatar = ref('')

  uid.value = helper.storage.get('uid') || 0
  nickname.value = helper.storage.get('nickname') || ''
  avatar.value = helper.storage.get('avatar') || defaultAvatar

  const updateProfile = (nn, at) => {
    nickname.value = nn
    avatar.value = at
    helper.storage.set('nickname', nn);
    helper.storage.set('avatar', at);
  }

  const updateLoginInfo = loginedUser => {
    uid.value = loginedUser.id
    nickname.value = loginedUser.nickname
    avatar.value = loginedUser.avatar

    helper.storage.set('uid', loginedUser.id);
    helper.storage.set('nickname', loginedUser.nickname);
    helper.storage.set('avatar', loginedUser.avatar);
    Cookies.set('token', loginedUser.token);
  }

  return {
    uid,
    nickname,
    avatar,
    updateProfile,
    updateLoginInfo
  }
})

export default useUserStore
