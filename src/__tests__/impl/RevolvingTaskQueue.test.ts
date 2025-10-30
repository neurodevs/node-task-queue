import generateId from '@neurodevs/generate-id'
import { test, assert } from '@neurodevs/node-tdd'

import RevolvingTaskQueue, {
    RevolvingQueueOptions,
} from '../../impl/RevolvingTaskQueue.js'
import SpyRevolvingQueue from '../../testDoubles/RevolvingQueue/SpyRevolvingQueue.js'
import { Task } from '../../types.js'
import AbstractPackageTest from '../AbstractPackageTest.js'

export default class RevolvingQueueTest extends AbstractPackageTest {
    private static quickQueue: SpyRevolvingQueue
    private static instance: SpyRevolvingQueue
    private static delayTaskMs: number
    private static taskTimeoutMs: number

    protected static async beforeEach() {
        await super.beforeEach()

        RevolvingTaskQueue.Class = SpyRevolvingQueue
        this.delayTaskMs = 10
        this.taskTimeoutMs = 20

        this.quickQueue = this.RevolvingTaskQueue({
            taskTimeoutMs: this.taskTimeoutMs,
        })
        this.instance = this.RevolvingTaskQueue()
    }

    @test()
    protected static async createsInstance() {
        assert.isTruthy(this.instance, 'Failed to create instance!')
    }

    @test()
    protected static async canPushTask() {
        this.pushTaskQuick({})
    }

    @test()
    protected static async pushTaskAutomaticallyStartsTask() {
        let wasHit = false

        const callback = () => {
            wasHit = true
        }

        this.pushTaskQuick({ callback })
        assert.isTrue(wasHit)
    }

    @test()
    protected static async nextTaskDoesNotStartUntilPreviousTaskIsDone() {
        let hits: string[] = []

        const callback1 = async () => {
            await this.wait(this.delayTaskMs)
            hits.push('task1')
        }

        const callback2 = () => {
            hits.push('task2')
        }

        this.pushTaskQuick({ callback: callback1 })
        this.pushTaskQuick({ callback: callback2 })

        await this.wait(this.delayTaskMs)

        assert.isEqualDeep(hits, ['task1', 'task2'])
    }

    @test()
    protected static async throwsIfSyncTaskCallbackFails() {
        const callback = () => {
            throw new Error(this.originalError)
        }

        const lastError = await this.pushTaskWaitMsGetLastError({
            callback,
        })

        const formattedName = this.formatName(this.callbackName)
        const formattedCallback = this.formatCallback(callback.toString())
        const formattedError = this.formatError(this.originalError)

        assert.isEqual(
            lastError.message,
            `Task callback failed! ${formattedName} ${formattedCallback} ${formattedError}`
        )
    }

    @test()
    protected static async throwsIfAsyncTaskCallbackFails() {
        const callback = async () => {
            throw new Error(this.originalError)
        }

        const lastError = await this.pushTaskWaitMsGetLastError({
            callback,
        })

        const formattedName = this.formatName(this.callbackName)
        const formattedCallback = this.formatCallback(callback.toString())
        const formattedError = this.formatError(this.originalError)

        assert.isEqual(
            lastError.message,
            `Task callback failed! ${formattedName} ${formattedCallback} ${formattedError}`
        )
    }

    @test()
    protected static async throwsTaskFailedWithCorrectErrorMessage() {
        const errorMessage = 'This is an error message!'

        const callback = () => {
            throw new Error(errorMessage)
        }

        const name = generateId()

        const err = await this.pushTaskWaitMsGetLastError({
            callback,
            name,
        })
        assert.doesInclude(err.message, errorMessage)
        assert.doesInclude(err.message, callback.toString())
        assert.doesInclude(err.message, name)
    }

    @test()
    protected static async nextTaskStartsIfPreviousTaskThrows() {
        let wasHit = false

        const callback1 = () => {
            throw new Error()
        }

        const callback2 = () => {
            wasHit = true
        }

        this.pushTaskQuick({ callback: callback1 })
        this.pushTaskQuick({ callback: callback2 })

        await this.waitForTaskPromiseToExecute()

        assert.isTrue(wasHit)
    }

    @test()
    protected static async throwsTaskTimedOutWithCorrectErrorMessage() {
        const timeoutMsToThrow = this.taskTimeoutMs * 1.2

        const callback = async () => {
            await this.wait(timeoutMsToThrow)
        }

        const lastError = await this.pushTaskWaitMsGetLastError(
            { callback },
            timeoutMsToThrow
        )

        const formattedName = this.formatName(this.callbackName)
        const formattedCallback = this.formatCallback(callback.toString())
        const timeoutMs = Math.round(this.taskTimeoutMs)

        assert.isEqual(
            lastError.message,
            `Task callback timed out after ${timeoutMs} milliseconds! ${formattedName} ${formattedCallback}`
        )
    }

    @test()
    protected static async clearsLastErrorAfterTaskCompletes() {
        const callback1 = () => {
            throw new Error()
        }

        this.pushTaskQuick({ callback: callback1 })

        const callback2 = () => {}

        const err = await this.pushTaskWaitMsGetLastError({
            callback: callback2,
        })
        assert.isFalsy(err)
    }

    @test()
    protected static async setsDefaultTaskTimeoutMsToThirtySeconds() {
        const thirtySecondsInMs = 30 * 1000
        assert.isEqual(this.instance.getTaskTimeoutMs(), thirtySecondsInMs)
    }

    @test()
    protected static async acceptsOptionalName() {
        const name = generateId()

        this.pushTaskQuick({ name })

        const tasks = this.quickQueue.getQueuedTasks()
        assert.isLength(tasks.pushedItems, 1)
        assert.isEqual(tasks.pushedItems[0].name, name)
    }

    @test()
    protected static async timeoutShouldNotFireIfTaskIsFinished() {
        this.quickQueue = this.RevolvingTaskQueue({ taskTimeoutMs: 50 })
        this.pushTaskQuick({
            callback: async () => {
                await this.wait(25)
            },
        })

        let wasHit = false

        this.quickQueue.handleTimeout = () => {
            wasHit = true
        }
        await this.wait(50)

        assert.isFalse(wasHit)
    }

    private static async pushTaskWaitMsGetLastError(
        task: Partial<Task>,
        waitMs?: number
    ) {
        this.pushTaskQuick(task)
        await this.waitForTaskPromiseToExecute(waitMs)

        return this.getLastError()!
    }

    private static pushTaskQuick(task: Partial<Task>) {
        const { name = this.callbackName, callback = this.callback } = task

        this.quickQueue.pushTask({
            name,
            callback,
        })
    }

    private static async waitForTaskPromiseToExecute(waitMs = 1) {
        await this.wait(waitMs)
    }

    private static getLastError() {
        return this.quickQueue.getLastError()
    }

    private static RevolvingTaskQueue(options?: RevolvingQueueOptions) {
        return RevolvingTaskQueue.Create(options) as SpyRevolvingQueue
    }
}
