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
