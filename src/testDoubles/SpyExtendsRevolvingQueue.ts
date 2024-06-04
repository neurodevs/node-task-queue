import { RevolvingQueueImpl } from '../RevolvingQueue'
import { RevolvingQueueOptions } from '../types/nodeTaskQueue.types'

export default class SpyExtendsRevolvingQueue extends RevolvingQueueImpl {
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

    protected throwIfLastError() {}
}

class SpyArray extends Array {
    public pushedItems: any[] = []

    public push(...items: any[]) {
        super.push(...items)
        this.pushedItems.push(...items)
        return this.length
    }
}
