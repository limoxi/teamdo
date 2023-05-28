class User {
    constructor(userData = undefined) {
        this.id = userData?.id || 0
        this.nickname = userData?.nickname || ''
        this.avatar = userData?.avatar || ''
        this.roles = (userData?.roles || '').split(',')
    }

    hasRole(roleName) {
        return this.roles.split(',').includes(roleName)
    }
}

export default User
