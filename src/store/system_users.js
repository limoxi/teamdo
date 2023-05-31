import {ref} from "vue";
import UserService from "@/business/user_service";
import {defineStore} from "pinia";

const useSystemUsersStore = defineStore('systemUsers', () => {
    const users = ref([])
    const id2user = ref({})
    const loaded = ref(false)

    const loadUsers = () => {
        if (loaded.value || users.value.length > 0) {
            return
        }

        UserService.getUsers().then(resp => {
            loaded.value = true
            users.value = resp
            users.value.forEach(user => {
                id2user.value[user.id] = user
            })
        })
    }

    return {
        loadUsers,
        id2user
    }
})

export default useSystemUsersStore
