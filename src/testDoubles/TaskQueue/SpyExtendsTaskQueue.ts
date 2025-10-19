import TaskQueueImpl from '../../impl/TaskQueue'

export default class SpyExtendsTaskQueueImpl extends TaskQueueImpl {
    public constructor() {
        super()
    }

    public getQueuedTasks() {
        return this.queuedTasks
    }
}
