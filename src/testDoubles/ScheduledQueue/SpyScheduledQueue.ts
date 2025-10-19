import ScheduledTaskQueue from '../../impl/ScheduledTaskQueue'

export default class SpyScheduledQueue extends ScheduledTaskQueue {
    public constructor() {
        super()
    }

    public getQueuedTasks() {
        return this.queuedTasks
    }
}
