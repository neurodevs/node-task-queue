import TaskQueueImpl from '../implementations/TaskQueue'

export default class SpyExtendsTaskQueueImpl extends TaskQueueImpl {
    public constructor() {
        super()
    }

    public getQueuedTasks() {
        return this.queuedTasks
    }
}
