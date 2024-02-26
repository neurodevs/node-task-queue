import TaskQueueImpl from '../implementations/TaskQueueImpl'

export default class SpyTaskQueueImpl extends TaskQueueImpl {
	public getQueuedTasks() {
		return this.queuedTasks
	}
}
