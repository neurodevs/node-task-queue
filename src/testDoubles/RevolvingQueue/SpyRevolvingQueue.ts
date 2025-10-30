import RevolvingTaskQueue, {
    RevolvingQueueOptions,
} from '../../impl/RevolvingTaskQueue.js'

export default class SpyRevolvingQueue extends RevolvingTaskQueue {
    public constructor(options?: RevolvingQueueOptions) {
        super(options)
        this.queuedTasks = new SpyArray()
    }

    public getLastError() {
        return this.lastError
    }

    public getTaskTimeoutMs() {
        return this.taskTimeoutMs
    }

    public getQueuedTasks() {
        return this.queuedTasks as SpyArray
    }

    public handleTimeout() {
        return super.handleTimeout()
    }
}

class SpyArray extends Array {
    public pushedItems: any[] = []

    public push(...items: any[]) {
        super.push(...items)
        this.pushedItems.push(...items)
        return this.length
    }
}
