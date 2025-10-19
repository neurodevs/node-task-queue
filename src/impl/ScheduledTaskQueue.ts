import SpruceError from '../errors/SpruceError'

export default class ScheduledTaskQueue implements ScheduledQueue {
    public static Class?: ScheduledQueueConstructor

    protected queuedTasks: Task[]
    private isRunning: boolean
    private resolveWait?: () => void
    private lastError?: SpruceError

    protected constructor() {
        this.queuedTasks = []
        this.isRunning = false
    }

    public static Create() {
        return new (this.Class ?? this)()
    }

    public pushTask(task: Task) {
        this.queuedTasks.push(task)
    }

    public async start() {
        this.assertAtLeastOneTaskQueued()
        this.isRunning = true
        await this.executeTasks()
    }

    private assertAtLeastOneTaskQueued() {
        if (this.queuedTasks.length === 0) {
            throw new SpruceError({ code: 'NO_QUEUED_TASKS' })
        }
    }

    private async executeTasks() {
        this.lastError = undefined

        while (this.queuedTasks.length > 0 && this.isRunning) {
            const task = this.queuedTasks.shift()!
            const { callback, waitAfterMs } = task

            void this.tryToExecute(callback)

            if (waitAfterMs && !this.lastError) {
                await this.wait(waitAfterMs)
            }

            if (this.lastError) {
                this.queuedTasks.unshift(task)
                throw this.lastError
            }
        }
    }

    private async tryToExecute(callback: TaskCallback) {
        try {
            await callback()
        } catch (error) {
            this.lastError = new SpruceError({
                code: 'TASK_CALLBACK_FAILED',
                originalError: error as Error,
            })

            this.resolveWait?.()
        }
    }

    private async wait(waitMs: number) {
        await new Promise((resolve) => {
            this.resolveWait = resolve as any
            setTimeout(resolve, waitMs)
        })
    }

    public async stop() {
        this.assertQueueIsRunning()
        this.isRunning = false
        this.queuedTasks = []

        if (this.resolveWait) {
            this.resolveWait()
        }
    }

    private assertQueueIsRunning() {
        if (!this.isRunning) {
            throw new SpruceError({ code: 'QUEUE_NOT_STARTED' })
        }
    }
}

export interface ScheduledQueue {
    pushTask(task: Task): void
    start(): Promise<void>
    stop(): Promise<void>
}

export type ScheduledQueueConstructor = new () => ScheduledQueue

export interface Task {
    callback: TaskCallback
    waitAfterMs?: number
}

export type TaskCallback = () => Promise<void> | void
