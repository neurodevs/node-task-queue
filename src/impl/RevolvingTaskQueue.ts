import { buildLog } from '@sprucelabs/spruce-skill-utils'
import SpruceError from '../errors/SpruceError'
import { TaskCallback } from './ScheduledTaskQueue'

export default class RevolvingTaskQueue implements RevolvingQueue {
    public static Class?: RevolvingQueueConstructor
    private static timeoutRejectMessage = 'Task timed out!'

    protected lastError?: SpruceError
    protected taskTimeoutMs: number
    protected queuedTasks: RevolvingTask[]
    private isRunning: boolean
    private timeoutReject?: (reason?: string) => void

    private log = buildLog('RevolvingTaskQueue')
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

    public pushTask(task: RevolvingTask) {
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

    private async tryToExecute(task: RevolvingTask) {
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

    private async executeTaskWithTimeout(task: RevolvingTask) {
        delete this.lastError

        const taskPromise = this.startTask(task)
        const timeoutPromise = this.startTimeout()

        await Promise.race([taskPromise, timeoutPromise])
    }

    private async startTask(task: RevolvingTask) {
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

    private handleError(err: any, task: RevolvingTask) {
        if (err === RevolvingTaskQueue.timeoutRejectMessage) {
            this.handleTimedOutError(task)
        } else {
            this.handleFailedError(err, task)
        }
    }

    private handleFailedError(err: Error, task: RevolvingTask) {
        const { callback, name } = task
        this.lastError = new SpruceError({
            code: 'TASK_CALLBACK_FAILED',
            originalError: err,
            callback: callback.toString(),
            name,
        })
    }

    private handleTimedOutError(task: RevolvingTask) {
        const { callback, name } = task
        this.lastError = new SpruceError({
            code: 'TASK_CALLBACK_TIMED_OUT',
            timeoutMs: this.taskTimeoutMs,
            callback: callback.toString(),
            name,
        })
    }

    private get isQueueEmpty() {
        return this.queuedTasks.length === 0
    }

    private logPushTask(task: RevolvingTask) {
        const { name } = task
        this.log.info(`Pushing task${this.formatName(name)}...`)
    }

    private logStartTask(task: RevolvingTask) {
        const { name } = task
        this.log.info(`Starting task${this.formatName(name)}...`)
    }

    private formatName(name?: string) {
        return name ? `: ${name}` : ''
    }
}

export interface RevolvingQueue {
    pushTask(task: RevolvingTask): void
}

export type RevolvingQueueConstructor = new (
    options?: RevolvingQueueOptions
) => RevolvingQueue

export interface RevolvingQueueOptions {
    taskTimeoutMs?: number
}

export interface RevolvingTask {
    callback: TaskCallback
    name?: string
}
