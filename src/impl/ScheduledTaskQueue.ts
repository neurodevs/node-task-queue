import { Task, TaskCallback } from '../types.js'

export default class ScheduledTaskQueue implements ScheduledQueue {
    public static Class?: ScheduledQueueConstructor

    protected queuedTasks: ScheduledTask[]
    private isRunning: boolean
    private resolveWait?: () => void
    private lastError?: Error

    protected constructor() {
        this.queuedTasks = []
        this.isRunning = false
    }

    public static Create() {
        return new (this.Class ?? this)()
    }

    public pushTask(task: ScheduledTask) {
        this.queuedTasks.push(task)
    }

    public async start() {
        this.assertAtLeastOneTaskQueued()
        this.isRunning = true
        await this.executeTasks()
    }

    private assertAtLeastOneTaskQueued() {
        if (this.queuedTasks.length === 0) {
            throw new Error('Cannot start task queue if no tasks are queued!')
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
        } catch (error: unknown) {
            this.throwTaskCallbackFailed(callback, error as Error)
            this.resolveWait?.()
        }
    }

    private throwTaskCallbackFailed(
        callback: TaskCallback,
        originalError: Error
    ) {
        const formattedCallback = this.formatCallback(callback.toString())
        const formattedName = this.formatName(callback.name)
        const formattedError = this.formatError(originalError.message)

        this.lastError = new Error(
            `Task callback failed! ${formattedName} ${formattedCallback} ${formattedError}`
        )
    }

    private formatCallback(callback: string) {
        return `\n\nFailing callback:\n\n${callback}\n\n`
    }

    private formatName(name: string) {
        return `Task Name: ${name}`
    }

    private formatError(err: string) {
        return `\n\nOriginal error:\n\n${err}\n\n`
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
            throw new Error(
                'Cannot stop task queue if it has not been started!'
            )
        }
    }
}

export interface ScheduledQueue {
    pushTask(task: ScheduledTask): void
    start(): Promise<void>
    stop(): Promise<void>
}

export type ScheduledQueueConstructor = new () => ScheduledQueue

export interface ScheduledTask extends Task {
    waitAfterMs: number
}
