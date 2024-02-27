import SpruceError from '../errors/SpruceError'
import { TaskQueue, Task, TaskCallback } from '../types/nodeTaskQueue.types'

export default class TaskQueueImpl implements TaskQueue {
	protected queuedTasks: Task[]
	private isRunning: boolean
	private waitResolve?: () => void
	private lastError?: SpruceError

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

			void this.tryToExecute(callback)

			if (waitAfterMs && !this.lastError) {
				await this.wait(waitAfterMs)
			}

			if (this.lastError) {
				throw this.lastError
			}

			// calling start after fail doesn't automatically fail
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

			this.waitResolve?.()
		}
	}

	private async wait(waitMs: number) {
		await new Promise((resolve) => {
			this.waitResolve = resolve as any
			setTimeout(resolve, waitMs)
		})
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
