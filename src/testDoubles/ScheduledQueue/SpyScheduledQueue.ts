import ScheduledTaskQueue from '../../impl/ScheduledTaskQueue.js'

export default class SpyScheduledQueue extends ScheduledTaskQueue {
    public constructor() {
        super()
    }

    public getQueuedTasks() {
        return this.queuedTasks
    }
}
