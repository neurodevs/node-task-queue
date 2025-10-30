import { Task } from '../types.js'

export default class RevolvingTaskQueue implements RevolvingQueue {
    public static Class?: RevolvingQueueConstructor
    private static timeoutRejectMessage = 'Task timed out!'

    protected lastError?: Error
    protected taskTimeoutMs: number
    protected queuedTasks: Task[]
    private isRunning: boolean
    private timeoutReject?: (reason?: string) => void

    private log = console
    private timeout?: any

    protected constructor(options?: RevolvingQueueOptions) {
        const { taskTimeoutMs } = options ?? {}

        this.taskTimeoutMs = taskTimeoutMs ?? 30 * 1000
        this.queuedTasks = []
        this.isRunning = false
    }

    public static Create(options?: RevolvingQueueOptions) {
        return new (this.Class ?? this)(options)
    }

    public pushTask(task: Task) {
        this.logPushTask(task)
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

    private async tryToExecute(task: Task) {
        try {
            await this.executeTaskWithTimeout(task)
        } catch (err: any) {
            this.handleError(err, task)
        } finally {
            this.isRunning = false
            clearTimeout(this.timeout)
            void this.startNextTask()
        }
    }

    private async executeTaskWithTimeout(task: Task) {
        delete this.lastError

        const taskPromise = this.startTask(task)
        const timeoutPromise = this.startTimeout()

        await Promise.race([taskPromise, timeoutPromise])
    }

    private async startTask(task: Task) {
        this.logStartTask(task)
        const { callback } = task
        return await callback()
    }

    private startTimeout() {
        return new Promise((_resolve, reject) => {
            this.timeout = setTimeout(() => {
                this.timeoutReject = reject
                this.handleTimeout()
            }, this.taskTimeoutMs)
        })
    }

    protected handleTimeout() {
        this.timeoutReject?.(RevolvingTaskQueue.timeoutRejectMessage)
    }

    private handleError(err: any, task: Task) {
        if (err === RevolvingTaskQueue.timeoutRejectMessage) {
            this.handleTimedOutError(task)
        } else {
            this.handleFailedError(err, task)
        }
    }

    private handleFailedError(err: Error, task: Task) {
        const { name, callback } = task

        const formattedCallback = this.formatCallback(callback.toString())
        const formattedName = this.formatName(name)
        const formattedError = this.formatError(err.message)

        this.lastError = new Error(
            `Task callback failed! ${formattedName} ${formattedCallback} ${formattedError}`
        )
    }

    private handleTimedOutError(task: Task) {
        const { callback, name } = task

        const formattedCallback = this.formatCallback(callback.toString())
        const formattedName = this.formatName(name)

        this.lastError = new Error(
            `Task callback timed out after ${this.taskTimeoutMs} milliseconds! ${formattedName} ${formattedCallback}`
        )
    }

    private get isQueueEmpty() {
        return this.queuedTasks.length === 0
    }

    private logPushTask(task: Task) {
        const { name } = task
        this.log.info(`Pushing task${this.formatName(name)}...`)
    }

    private logStartTask(task: Task) {
        const { name } = task
        this.log.info(`Starting task${this.formatName(name)}...`)
    }

    private formatName(name: string) {
        return `Task Name: ${name}`
    }

    private formatCallback(callback: string) {
        return `\n\nFailing callback:\n\n${callback}\n\n`
    }

    private formatError(err: string) {
        return `\n\nOriginal error:\n\n${err}\n\n`
    }
}

export interface RevolvingQueue {
    pushTask(task: Task): void
}

export type RevolvingQueueConstructor = new (
    options?: RevolvingQueueOptions
) => RevolvingQueue

export interface RevolvingQueueOptions {
    taskTimeoutMs?: number
}
