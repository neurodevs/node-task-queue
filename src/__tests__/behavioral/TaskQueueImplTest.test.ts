import { randomInt } from 'crypto'
import AbstractSpruceTest, {
	test,
	assert,
	errorAssert,
} from '@sprucelabs/test-utils'
import SpyTaskQueueImpl from '../../testDoubles/SpyTaskQueueImpl'

export default class TaskQueueImplTest extends AbstractSpruceTest {
	private static queue: SpyTaskQueueImpl
	private static callback: () => void
	private static waitAfterMs: number

	protected static async beforeEach() {
		await super.beforeEach()

		this.queue = new SpyTaskQueueImpl()
		this.callback = () => {}
		this.waitAfterMs = randomInt(20, 50)

		assert.isTruthy(this.queue)
	}

	@test()
	protected static async throwsOnStartIfNoQueuedTasks() {
		const err = await assert.doesThrowAsync(
			() => this.startQueue(),
			'Cannot start task queue if no tasks are queued!'
		)
		errorAssert.assertError(err, 'NO_QUEUED_TASKS')
	}

	@test()
	protected static async throwsOnStopIfNotAlreadyStarted() {
		const err = await assert.doesThrowAsync(
			() => this.stopQueue(),
			'Cannot stop task queue if it has not been started!'
		)
		errorAssert.assertError(err, 'QUEUE_NOT_STARTED')
	}

	@test()
	protected static async throwsIfTaskCallbackFails() {
		const originalError = 'Original error message!'

		this.pushTask({
			callback: () => {
				throw new Error(originalError)
			},
		})

		const err = await assert.doesThrowAsync(
			() => this.startQueue(),
			`Task callback failed! Original error:\n\n${originalError}`
		)

		errorAssert.assertError(err, 'TASK_CALLBACK_FAILED')
	}

	@test()
	protected static async queuesOneTask() {
		const task = this.pushTask()
		const queuedTasks = this.getQueuedTasks()
		assert.isEqualDeep(queuedTasks, [task])
	}

	@test()
	protected static async queuesTwoTasks() {
		const task1 = this.pushTask()
		const task2 = this.pushTask()
		const queuedTasks = this.getQueuedTasks()
		assert.isEqualDeep(queuedTasks, [task1, task2])
	}

	@test()
	protected static async startExecutesCallbackForOneQueuedTask() {
		let wasHit = false

		const mockCallback = () => {
			wasHit = true
		}

		this.pushTask({ callback: mockCallback })
		await this.startQueue()
		assert.isTrue(wasHit)
	}

	@test()
	protected static async startExecutesCallbackForTwoQueuedTasks() {
		let wasHit1 = false
		let wasHit2 = false

		const mockCallback1 = () => {
			wasHit1 = true
		}

		const mockCallback2 = () => {
			wasHit2 = true
		}

		this.pushTask({ callback: mockCallback1 })
		this.pushTask({ callback: mockCallback2 })
		await this.startQueue()
		assert.isTrue(wasHit1)
		assert.isTrue(wasHit2)
	}

	@test()
	protected static async startWaitsForExpectedDuration() {
		this.pushTask()
		const startTime = Date.now()
		await this.startQueue()
		const endTime = Date.now()

		const duration = endTime - startTime
		assert.isAbove(duration, 0.9 * this.waitAfterMs)
		assert.isBelow(duration, 1.1 * this.waitAfterMs)
	}

	@test()
	protected static async stopCancelsOneQueuedTasks() {
		this.pushTask()
		const startPromise = this.startQueue()
		await this.stopQueue()
		const queuedTasks = this.getQueuedTasks()
		assert.isEqualDeep(queuedTasks, [])

		await startPromise
	}

	@test()
	protected static async stopCancelsTwoQueuedTasks() {
		this.pushTask()
		this.pushTask()
		const startPromise = this.startQueue()
		await this.stopQueue()
		const queuedTasks = this.getQueuedTasks()
		assert.isEqualDeep(queuedTasks, [])

		await startPromise
	}

	@test()
	protected static async stopPreventsCallbackFromBeingExecuted() {
		let wasHit = false

		const mockCallback = () => {
			wasHit = true
		}

		this.pushTask()
		this.pushTask({ callback: mockCallback, waitAfterMs: 1000 })
		const startPromise = this.startQueue()
		await this.stopQueue()
		await startPromise
		assert.isFalse(wasHit)
	}

	private static pushTask(options?: {
		callback?: () => void
		waitAfterMs?: number
	}) {
		const { callback = this.callback, waitAfterMs = this.waitAfterMs } =
			options ?? {}

		this.queue.pushTask({ callback, waitAfterMs })
		return { callback, waitAfterMs }
	}

	private static getQueuedTasks() {
		return this.queue.getQueuedTasks()
	}

	private static async startQueue() {
		await this.queue.start()
	}

	private static async stopQueue() {
		await this.queue.stop()
	}
}
