class Lane {
    constructor(project, data, posi = 1) {
        this.projectId = project.id
        this.id = data?.id ?? 0
        this.name = data?.name ?? ''
        this.wip = data?.wip ?? 8
        this.isEnd = data?.is_end ?? false

        this.isFirst = false
        this.isLast = false
        switch (posi) {
            case 0:
                this.isFirst = true
                break
            case -1:
                this.isLast = true
        }

        this.needRefresh = false
    }

    refresh() {
        this.needRefresh = true
    }
}

export default Lane
