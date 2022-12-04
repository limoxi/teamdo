class EpicTask {
	constructor(taskData = undefined) {
		this.id = taskData?.id ?? 0
		this.creatorId = taskData?.creator_id ?? 0
		this.name = taskData?.name ?? ''
		this.importance = taskData?.importance ?? 0
		this.desc = taskData?.desc ?? ''
		this.tags = taskData?.tags ?? []
		this.expectedFinishedAt = taskData?.expected_finished_at ?? ''
		this.updatedAt = taskData?.updated_at ?? ''
		this.createdAt = taskData?.created_at ?? ''
		this.docLink = taskData?.meta_data?.doc_link ?? ''
		this.designLink = taskData?.meta_data?.design_link ?? ''
		this.status = taskData?.status ?? '未知'
	}
}

export default EpicTask
