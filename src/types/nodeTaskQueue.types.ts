export interface TaskQueue {
    pushTask(task: Task): void
    start(): Promise<void>
    stop(): Promise<void>
}

export type TaskQueueConstructor = new () => TaskQueue

export interface Task {
    callback: TaskCallback
    waitAfterMs?: number
}

export type TaskCallback = () => Promise<void> | void

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
