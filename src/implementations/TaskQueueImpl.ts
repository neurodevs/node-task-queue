import SpruceError from '../errors/SpruceError'
import { TaskQueue, Task, TaskCallback } from '../types/nodeTaskQueue.types'

export default class TaskQueueImpl implements TaskQueue {
	protected queuedTasks: Task[]
	private isRunning: boolean

	public constructor() {
		this.queuedTasks = []
		this.isRunning = false
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
		for (const task of this.queuedTasks) {
			if (!this.isRunning) {
				break
			}
			const { callback, waitAfterMs } = task

			this.tryToExecute(callback)

			if (waitAfterMs) {
				await this.wait(waitAfterMs)
			}
		}
	}

	private tryToExecute(callback: TaskCallback) {
		try {
			callback()
		} catch (error) {
			throw new SpruceError({
				code: 'TASK_CALLBACK_FAILED',
				originalError: error as Error,
			})
		}
	}

	private async wait(waitMs: number) {
		await new Promise((resolve) => setTimeout(resolve, waitMs))
	}

	public async stop() {
		this.assertQueueIsRunning()
		this.isRunning = false
		this.queuedTasks = []
	}

	private assertQueueIsRunning() {
		if (!this.isRunning) {
			throw new SpruceError({ code: 'QUEUE_NOT_STARTED' })
		}
	}
}
