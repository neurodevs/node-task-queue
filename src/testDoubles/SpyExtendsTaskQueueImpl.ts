import TaskQueueImpl from '../implementations/TaskQueueImpl'

export default class SpyExtendsTaskQueueImpl extends TaskQueueImpl {
	public getQueuedTasks() {
		return this.queuedTasks
	}
}
