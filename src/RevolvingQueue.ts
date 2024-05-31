import SpruceError from './errors/SpruceError'
import {
    RevolvingQueue,
    TaskCallback,
    RevolvingQueueOptions,
    RevolvingQueueConstructor,
} from './types/nodeTaskQueue.types'

export class RevolvingQueueImpl implements RevolvingQueue {
    public static Class?: RevolvingQueueConstructor

    protected lastError?: SpruceError
    protected taskTimeoutMs: number
    private queuedTasks: TaskCallback[]
    private isRunning: boolean

    protected constructor(options?: RevolvingQueueOptions) {
        const { taskTimeoutMs } = options ?? {}

        this.taskTimeoutMs = taskTimeoutMs ?? 30 * 1000
        this.queuedTasks = []
        this.isRunning = false
    }

    public static Queue(options?: RevolvingQueueOptions) {
        return new (this.Class ?? this)(options)
    }

    public pushTask(task: TaskCallback) {
        this.queuedTasks.push(task)
        void this.startNextTask()
    }

    private async startNextTask() {
        if (this.isRunning || this.isQueueEmpty) {
            return
        }

        this.isRunning = true

        const task = this.queuedTasks.shift()!
        await this.tryToExecute(task)
    }

    private async tryToExecute(task: TaskCallback) {
        try {
            await this.executeTaskWithTimeout(task)
        } catch (err) {
            this.handleFailedError(err as Error, task)
            this.throwIfLastError()
        } finally {
            this.isRunning = false
            void this.startNextTask()
        }
    }

    private async executeTaskWithTimeout(task: TaskCallback) {
        delete this.lastError

        const taskPromise = this.startTask(task)
        const timeoutPromise = this.startTimeout()

        const result = await Promise.race([taskPromise, timeoutPromise])

        if (!result && task.constructor.name === 'AsyncFunction') {
            this.handleTimedOutError(task)
            this.throwIfLastError()
        }
    }

    private async startTask(task: TaskCallback) {
        return await task()
    }

    private startTimeout() {
        return new Promise((_, reject) =>
            setTimeout(() => reject('Task timed out!'), this.taskTimeoutMs)
        )
    }

    private handleFailedError(err: Error, task: TaskCallback) {
        this.lastError = new SpruceError({
            code: 'TASK_CALLBACK_FAILED',
            originalError: err,
            task: task.toString(),
        })
    }

    private handleTimedOutError(task: TaskCallback) {
        this.lastError = new SpruceError({
            code: 'TASK_CALLBACK_TIMED_OUT',
            timeoutMs: this.taskTimeoutMs,
            task: task.toString(),
        })
    }

    protected throwIfLastError() {
        if (this.lastError) {
            throw this.lastError
        }
    }

    private get isQueueEmpty() {
        return this.queuedTasks.length === 0
    }
}
