import TaskQueueImpl from '../implementations/TaskQueueImpl'

export default class SpyExtendsTaskQueueImpl extends TaskQueueImpl {
	public constructor() {
		super()
	}

	public getQueuedTasks() {
		return this.queuedTasks
	}
}
