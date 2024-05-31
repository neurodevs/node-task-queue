import { RevolvingQueueImpl } from '../RevolvingQueue'
import { RevolvingQueueOptions } from '../types/nodeTaskQueue.types'

export default class SpyExtendsRevolvingQueue extends RevolvingQueueImpl {
    public constructor(options?: RevolvingQueueOptions) {
        super(options)
    }

    public getLastError() {
        return this.lastError
    }

    public getTaskTimeoutMs() {
        return this.taskTimeoutMs
    }

    protected throwIfLastError() {}
}
