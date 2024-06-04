import AbstractSpruceTest, {
    test,
    assert,
    errorAssert,
    generateId,
} from '@sprucelabs/test-utils'
import { RevolvingQueueImpl } from '../../RevolvingQueue'
import SpyExtendsRevolvingQueue from '../../testDoubles/SpyExtendsRevolvingQueue'
import {
    RevolvingQueueOptions,
    RevolvingTask,
} from '../../types/nodeTaskQueue.types'

export default class RevolvingQueueTest extends AbstractSpruceTest {
    private static quickQueue: SpyExtendsRevolvingQueue
    private static defaultQueue: SpyExtendsRevolvingQueue
    private static delayTaskMs: number
    private static taskTimeoutMs: number

    protected static async beforeEach() {
        await super.beforeEach()

        RevolvingQueueImpl.Class = SpyExtendsRevolvingQueue
        this.delayTaskMs = 10
        this.taskTimeoutMs = 20

        this.quickQueue = this.Queue({ taskTimeoutMs: this.taskTimeoutMs })
        this.defaultQueue = this.Queue()
    }

    @test()
    protected static async canCreateRevolvingQueue() {
        assert.isTruthy(this.quickQueue)
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
            throw new Error()
        }

        const err = await this.pushTaskWaitMsGetLastError({
            callback,
        })
        errorAssert.assertError(err, 'TASK_CALLBACK_FAILED')
    }

    @test()
    protected static async throwsIfAsyncTaskCallbackFails() {
        const callback = async () => {
            throw new Error()
        }

        const err = await this.pushTaskWaitMsGetLastError({
            callback,
        })
        errorAssert.assertError(err, 'TASK_CALLBACK_FAILED')
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

        const name = generateId()

        const err = await this.pushTaskWaitMsGetLastError(
            { callback, name },
            timeoutMsToThrow
        )

        errorAssert.assertError(err, 'TASK_CALLBACK_TIMED_OUT')
        assert.doesInclude(err.message, this.taskTimeoutMs.toString())
        assert.doesInclude(err.message, callback.toString())
        assert.doesInclude(err.message, name)
    }

    @test()
    protected static async clearsLastErrorAfterTaskCompletes() {
        const callback1 = () => {
            throw new Error()
        }

        await this.pushTaskQuick({ callback: callback1 })

        const callback2 = () => {}

        const err = await this.pushTaskWaitMsGetLastError({
            callback: callback2,
        })
        assert.isFalsy(err)
    }

    @test()
    protected static async setsDefaultTaskTimeoutMsToThirtySeconds() {
        const thirtySecondsInMs = 30 * 1000
        assert.isEqual(this.defaultQueue.getTaskTimeoutMs(), thirtySecondsInMs)
    }

    @test()
    protected static async acceptsOptionalName() {
        const name = generateId()

        this.pushTaskQuick({ name })

        const tasks = this.quickQueue.getQueuedTasks()
        assert.isLength(tasks.pushedItems, 1)
        assert.isEqual(tasks.pushedItems[0].name, name)
    }

    private static async pushTaskWaitMsGetLastError(
        task: RevolvingTask,
        waitMs?: number
    ) {
        this.pushTaskQuick(task)
        await this.waitForTaskPromiseToExecute(waitMs)

        return this.getLastError()!
    }

    private static pushTaskQuick(task: Partial<RevolvingTask>) {
        const { callback, name } = task

        this.quickQueue.pushTask({
            callback: callback ?? (() => {}),
            name: name ?? generateId(),
        })
    }

    private static async waitForTaskPromiseToExecute(waitMs = 1) {
        await this.wait(waitMs)
    }

    private static getLastError() {
        return this.quickQueue.getLastError()
    }

    private static Queue(options?: RevolvingQueueOptions) {
        return RevolvingQueueImpl.Queue(options) as SpyExtendsRevolvingQueue
    }
}
