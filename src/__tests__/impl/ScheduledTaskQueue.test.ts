import { randomInt } from 'crypto'
import { test, assert } from '@sprucelabs/test-utils'
import ScheduledTaskQueue, {
    ScheduledTask,
} from '../../impl/ScheduledTaskQueue'
import SpyScheduledQueue from '../../testDoubles/ScheduledQueue/SpyScheduledQueue'
import { TaskCallback } from '../../types'
import AbstractPackageTest from '../AbstractPackageTest'

export default class ScheduledTaskQueueTest extends AbstractPackageTest {
    private static instance: SpyScheduledQueue
    private static waitAfterMs: number

    protected static async beforeEach() {
        await super.beforeEach()

        ScheduledTaskQueue.Class = SpyScheduledQueue

        this.waitAfterMs = randomInt(20, 50)

        this.instance = this.ScheduledTaskQueue()
    }

    @test()
    protected static async createsInstance() {
        assert.isTruthy(this.instance, 'Failed to create instance!')
    }

    @test()
    protected static async throwsOnStartIfNoQueuedTasks() {
        await assert.doesThrowAsync(
            async () => await this.startQueue(),
            'Cannot start task queue if no tasks are queued!'
        )
    }

    @test()
    protected static async throwsOnStopIfNotAlreadyStarted() {
        await assert.doesThrowAsync(
            async () => await this.stopQueue(),
            'Cannot stop task queue if it has not been started!'
        )
    }

    @test()
    protected static async throwsIfSyncTaskCallbackFails() {
        const callback = () => {
            throw new Error(this.originalError)
        }

        await this.assertThrowsWithErrorCallback(callback)
    }

    @test()
    protected static async throwsIfAsyncTaskCallbackFails() {
        const callback = async () => {
            throw new Error(this.originalError)
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
        throw new Error('Original error!')
    })
    @test('does not wait after thrown async function', async () => {
        throw new Error('Original error!')
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
                throw new Error(this.originalError)
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

    private static pushTask(task?: Partial<ScheduledTask>) {
        const {
            callback = this.callback,
            name = this.callbackName,
            waitAfterMs = this.waitAfterMs,
        } = task ?? {}

        const formattedTask = {
            name,
            callback,
            waitAfterMs,
        }
        this.instance.pushTask(formattedTask)

        return formattedTask
    }

    private static async startQueue() {
        await this.instance.start()
    }

    private static async stopQueue() {
        await this.instance.stop()
    }

    private static getQueuedTasks() {
        return this.instance.getQueuedTasks()
    }

    private static async assertThrowsWithErrorCallback(callback: () => void) {
        this.pushTask({ callback })

        const formattedName = this.formatName(callback.name)
        const formattedCallback = this.formatCallback(callback.toString())
        const formattedError = this.formatError(this.originalError)

        await assert.doesThrowAsync(
            async () => await this.startQueue(),
            `Task callback failed! ${formattedName} ${formattedCallback} ${formattedError}`
        )
    }

    private static ScheduledTaskQueue() {
        return ScheduledTaskQueue.Create() as SpyScheduledQueue
    }
}
