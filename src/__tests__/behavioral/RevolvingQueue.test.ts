import AbstractSpruceTest, {
    test,
    assert,
    errorAssert,
} from '@sprucelabs/test-utils'
import { RevolvingQueueImpl } from '../../RevolvingQueue'
import SpyExtendsRevolvingQueue from '../../testDoubles/SpyExtendsRevolvingQueue'
import {
    TaskCallback,
    RevolvingQueueOptions,
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
        this.pushTask(() => {})
    }

    @test()
    protected static async pushTaskAutomaticallyStartsTask() {
        let wasHit = false

        const task = () => {
            wasHit = true
        }

        this.pushTask(task)
        assert.isTrue(wasHit)
    }

    @test()
    protected static async nextTaskDoesNotStartUntilPreviousTaskIsDone() {
        let hits: string[] = []

        const task1 = async () => {
            await this.wait(this.delayTaskMs)
            hits.push('task1')
        }

        const task2 = () => {
            hits.push('task2')
        }

        this.pushTask(task1)
        this.pushTask(task2)

        await this.wait(this.delayTaskMs)

        assert.isEqualDeep(hits, ['task1', 'task2'])
    }

    @test()
    protected static async throwsIfSyncTaskCallbackFails() {
        const task = () => {
            throw new Error()
        }

        const err = await this.pushTaskWaitGetLastError(task)
        errorAssert.assertError(err, 'TASK_CALLBACK_FAILED')
    }

    @test()
    protected static async throwsIfAsyncTaskCallbackFails() {
        const task = async () => {
            throw new Error()
        }

        const err = await this.pushTaskWaitGetLastError(task)
        errorAssert.assertError(err, 'TASK_CALLBACK_FAILED')
    }

    @test()
    protected static async throwsTaskFailedWithCorrectErrorMessage() {
        const errorMessage = 'This is an error message!'

        const task = () => {
            throw new Error(errorMessage)
        }

        const err = await this.pushTaskWaitGetLastError(task)
        assert.doesInclude(err.message, errorMessage)
        assert.doesInclude(err.message, task.toString())
    }

    @test()
    protected static async nextTaskStartsIfPreviousTaskThrows() {
        let wasHit = false

        const task1 = () => {
            throw new Error()
        }

        const task2 = () => {
            wasHit = true
        }

        this.pushTask(task1)
        this.pushTask(task2)

        await this.waitForTaskPromiseToExecute()

        assert.isTrue(wasHit)
    }

    @test()
    protected static async throwsTaskTimedOutWithCorrectErrorMessage() {
        const task = async () => {
            await this.wait(this.delayTaskMs)
        }

        const err = await this.pushTaskWaitGetLastError(task, this.delayTaskMs)
        errorAssert.assertError(err, 'TASK_CALLBACK_TIMED_OUT')
        assert.doesInclude(err.message, this.taskTimeoutMs.toString())
        assert.doesInclude(err.message, task.toString())
    }

    @test()
    protected static async clearsLastErrorAfterTaskCompletes() {
        const task1 = () => {
            throw new Error()
        }

        await this.pushTask(task1)

        const task2 = () => {}

        const err = await this.pushTaskWaitGetLastError(task2)
        assert.isFalsy(err)
    }

    @test()
    protected static async setsDefaultTaskTimeoutMsToThirtySeconds() {
        const thirtySecondsInMs = 30 * 1000
        assert.isEqual(this.defaultQueue.getTaskTimeoutMs(), thirtySecondsInMs)
    }

    private static async pushTaskWaitGetLastError(
        task: TaskCallback,
        waitMs?: number
    ) {
        this.pushTask(task)
        await this.waitForTaskPromiseToExecute(waitMs)
        return this.getLastError()!
    }

    private static async waitForTaskPromiseToExecute(waitMs = 1) {
        await this.wait(waitMs)
    }

    private static pushTask(task: TaskCallback) {
        this.quickQueue.pushTask(task)
    }

    private static getLastError() {
        return this.quickQueue.getLastError()
    }

    private static Queue(options?: RevolvingQueueOptions) {
        return RevolvingQueueImpl.Queue(options) as SpyExtendsRevolvingQueue
    }
}
