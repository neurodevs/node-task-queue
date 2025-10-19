import { randomInt } from 'crypto'
import AbstractSpruceTest, {
    test,
    assert,
    errorAssert,
    generateId,
} from '@sprucelabs/test-utils'
import TaskQueueImpl from '../../impl/TaskQueue'
import SpyExtendsTaskQueue from '../../testDoubles/TaskQueue/SpyExtendsTaskQueue'
import { TaskCallback } from '../../types/nodeTaskQueue.types'

export default class TaskQueueImplTest extends AbstractSpruceTest {
    private static queue: SpyExtendsTaskQueue
    private static callback: () => void
    private static waitAfterMs: number

    protected static async beforeEach() {
        await super.beforeEach()

        TaskQueueImpl.Class = SpyExtendsTaskQueue

        this.callback = () => {}
        this.waitAfterMs = randomInt(20, 50)
        this.queue = TaskQueueImpl.Queue() as SpyExtendsTaskQueue

        assert.isTruthy(this.queue)
    }

    @test()
    protected static async throwsOnStartIfNoQueuedTasks() {
        const err = await assert.doesThrowAsync(() => this.startQueue())
        errorAssert.assertError(err, 'NO_QUEUED_TASKS')
    }

    @test()
    protected static async throwsOnStopIfNotAlreadyStarted() {
        const err = await assert.doesThrowAsync(() => this.stopQueue())
        errorAssert.assertError(err, 'QUEUE_NOT_STARTED')
    }

    @test()
    protected static async throwsIfSyncTaskCallbackFails() {
        const callback = () => {
            throw new Error(generateId())
        }

        await this.assertThrowsWithErrorCallback(callback)
    }

    @test()
    protected static async throwsIfAsyncTaskCallbackFails() {
        const callback = async () => {
            throw new Error(generateId())
        }

        await this.assertThrowsWithErrorCallback(callback)
    }

    @test()
    protected static async hangingAsyncCallbackDoesNotInterruptTiming() {
        const hangingCallback = async () => {
            await new Promise((resolve) => setTimeout(resolve, 100))
        }

        this.pushTask({ callback: hangingCallback })
        this.pushTask()

        const startTime = Date.now()
        await this.startQueue()
        const endTime = Date.now()

        const expectedDuration = 2 * this.waitAfterMs

        const actualDuration = endTime - startTime
        assert.isAbove(actualDuration, 0.9 * expectedDuration)
        assert.isBelow(actualDuration, 1.1 * expectedDuration)
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

    @test('does not wait after thrown sync function', () => {
        throw new Error('Callback failed!')
    })
    @test('does not wait after thrown async function', async () => {
        throw new Error('Callback failed!')
    })
    protected static async doesNotWaitAfterMsIfTaskThrows(cb: TaskCallback) {
        const startTime = Date.now()

        this.pushTask({
            callback: cb,
            waitAfterMs: 100,
        })

        try {
            await this.startQueue()
        } catch {
            //empty
        } finally {
            const endTime = Date.now()
            const durationMs = endTime - startTime
            assert.isBelow(durationMs, 10)
        }
    }

    @test()
    protected static async callingStartAfterFailResumesFromFailedTask() {
        let numHits = 0

        const mockCallback = () => {
            numHits++
            if (numHits === 1) {
                throw new Error('Callback failed!')
            }
        }

        this.pushTask({ callback: mockCallback })
        this.pushTask()

        try {
            await this.startQueue()
        } catch {
            await this.startQueue()
        }
        assert.isEqual(numHits, 2)
    }

    @test()
    protected static async stoppingResolvesWait() {
        this.pushTask({ waitAfterMs: 1000 })

        const startTime = Date.now()

        const startPromise = this.startQueue()
        await this.stopQueue()
        await startPromise

        const endTime = Date.now()
        const durationMs = endTime - startTime
        assert.isBelow(durationMs, 10)
    }

    private static async assertThrowsWithErrorCallback(callback: () => void) {
        this.pushTask({ callback })

        const err = await assert.doesThrowAsync(() => this.startQueue())
        errorAssert.assertError(err, 'TASK_CALLBACK_FAILED')
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
